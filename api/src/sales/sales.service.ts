import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Medicine } from '../medicines/entities/medicine.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale) private readonly saleRepo: Repository<Sale>,
    @InjectRepository(SaleItem) private readonly itemRepo: Repository<SaleItem>,
    @InjectRepository(Medicine) private readonly medicineRepo: Repository<Medicine>,
  ) {}

  private generateSaleNumber(): string {
    const now = new Date();
    return `S-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 9000 + 1000)}`;
  }

  // Decrement medicine quantity directly
  private async decrementMedicineQuantity(medicineId: number, quantity: number) {
    const medicine = await this.medicineRepo.findOne({ where: { id: medicineId } });
    if (!medicine) {
      throw new BadRequestException(`Medicine with ID ${medicineId} not found`);
    }
    
    if (medicine.quantity < quantity) {
      throw new BadRequestException(`Insufficient stock. Available: ${medicine.quantity}, Requested: ${quantity}`);
    }
    
    medicine.quantity -= quantity;
    await this.medicineRepo.save(medicine);
  }

  async create(dto: CreateSaleDto): Promise<Sale> {
    if (!dto.items?.length) throw new BadRequestException('No items');
    for (const it of dto.items) {
      await this.decrementMedicineQuantity(it.medicineId, it.quantity);
    }

    const sale = this.saleRepo.create({
      saleNumber: this.generateSaleNumber(),
      saleDate: new Date(dto.saleDate),
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      discount: dto.discount ?? 0,
      tax: dto.tax ?? 0,
      paymentMethod: dto.paymentMethod,
    });
    sale.items = dto.items.map((i) => this.itemRepo.create({
      medicineId: i.medicineId,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      discount: i.discount ?? 0,
      totalPrice: (i.quantity * Number(i.unitPrice)) - ((i.discount ?? 0) * i.quantity),
    }));
    const subtotal = sale.items.reduce((s, it) => s + Number(it.totalPrice), 0);
    sale.totalAmount = subtotal + Number(sale.tax ?? 0);
    return this.saleRepo.save(sale);
  }

  async list(): Promise<Sale[]> {
    const sales = await this.saleRepo.find({ 
      relations: ['items', 'items.medicine'],
      order: { createdAt: 'DESC' } 
    });

    // Calculate profit for each sale
    return sales.map(sale => {
      const calculatedProfit = sale.items?.reduce((sum, item) => {
        if (item.medicine) {
          const profitPerUnit = Number(item.unitPrice) - Number(item.medicine.costPrice);
          const itemDiscount = Number(item.discount ?? 0) * item.quantity;
          return sum + (profitPerUnit * item.quantity) - itemDiscount;
        }
        return sum;
      }, 0) || 0;

      return { ...sale, calculatedProfit };
    });
  }

  async reportDaily(startIso?: string, endIso?: string) {
    const qb = this.saleRepo.createQueryBuilder('s')
      .select("TO_CHAR(s.saleDate, 'YYYY-MM-DD')", 'day')
      .addSelect('SUM(s.totalAmount)', 'total')
      .groupBy('day')
      .orderBy('day', 'ASC');
    if (startIso) qb.andWhere('s.saleDate >= :start', { start: startIso });
    if (endIso) qb.andWhere('s.saleDate <= :end', { end: endIso });
    return qb.getRawMany();
  }

  async reportMonthly(year?: number) {
    const qb = this.saleRepo.createQueryBuilder('s')
      .select("TO_CHAR(s.saleDate, 'YYYY-MM')", 'month')
      .addSelect('SUM(s.totalAmount)', 'total')
      .groupBy('month')
      .orderBy('month', 'ASC');
    if (year) qb.andWhere("EXTRACT(year from s.saleDate) = :y", { y: year });
    return qb.getRawMany();
  }

  async reportWeekly(startIso?: string, endIso?: string) {
    const qb = this.saleRepo.createQueryBuilder('s')
      .select("TO_CHAR(s.saleDate, 'YYYY-\"W\"WW')", 'week')
      .addSelect('SUM(s.totalAmount)', 'total')
      .groupBy('week')
      .orderBy('week', 'ASC');
    if (startIso) qb.andWhere('s.saleDate >= :start', { start: startIso });
    if (endIso) qb.andWhere('s.saleDate <= :end', { end: endIso });
    return qb.getRawMany();
  }

  // Increment medicine quantity (for reversing sales)
  private async incrementMedicineQuantity(medicineId: number, quantity: number) {
    const medicine = await this.medicineRepo.findOne({ where: { id: medicineId } });
    if (!medicine) {
      throw new BadRequestException(`Medicine with ID ${medicineId} not found`);
    }
    
    medicine.quantity += quantity;
    await this.medicineRepo.save(medicine);
  }

  async update(id: number, dto: UpdateSaleDto): Promise<Sale> {
    const sale = await this.saleRepo.findOne({ 
      where: { id }, 
      relations: ['items'] 
    });
    
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    // If items are being updated, handle stock changes
    if (dto.items) {
      // First, restore stock for existing items
      for (const existingItem of sale.items) {
        await this.incrementMedicineQuantity(existingItem.medicineId, existingItem.quantity);
      }

      // Then decrement stock for new items
      for (const newItem of dto.items) {
        if (newItem.medicineId && newItem.quantity) {
          await this.decrementMedicineQuantity(newItem.medicineId, newItem.quantity);
        }
      }

      // Remove existing items
      await this.itemRepo.delete({ saleId: id });

      // Create new items
      const newItems = dto.items
        .filter(item => item.medicineId && item.quantity && item.unitPrice)
        .map((item) => this.itemRepo.create({
          saleId: id,
          medicineId: item.medicineId!,
          quantity: item.quantity!,
          unitPrice: item.unitPrice!,
          totalPrice: item.quantity! * Number(item.unitPrice!),
        }));
      
      await this.itemRepo.save(newItems);
    }

    // Update sale properties
    const updateData: Partial<Sale> = {};
    if (dto.customerName !== undefined) updateData.customerName = dto.customerName;
    if (dto.customerPhone !== undefined) updateData.customerPhone = dto.customerPhone;
    if (dto.discount !== undefined) updateData.discount = dto.discount;
    if (dto.tax !== undefined) updateData.tax = dto.tax;
    if (dto.paymentMethod !== undefined) updateData.paymentMethod = dto.paymentMethod;
    if (dto.saleDate !== undefined) updateData.saleDate = new Date(dto.saleDate);

    // Recalculate total amount if items or amounts changed
    if (dto.items || dto.discount !== undefined || dto.tax !== undefined) {
      const updatedSale = await this.saleRepo.findOne({ 
        where: { id }, 
        relations: ['items'] 
      });
      if (updatedSale) {
        const subtotal = updatedSale.items.reduce((s, it) => s + Number(it.totalPrice), 0);
        updateData.totalAmount = subtotal - Number(updateData.discount ?? sale.discount ?? 0) + Number(updateData.tax ?? sale.tax ?? 0);
      }
    }

    await this.saleRepo.update(id, updateData);
    
    const updatedSale = await this.saleRepo.findOne({ 
      where: { id }, 
      relations: ['items', 'items.medicine'] 
    });
    
    if (!updatedSale) {
      throw new NotFoundException(`Sale with ID ${id} not found after update`);
    }
    
    return updatedSale;
  }

  async delete(id: number): Promise<void> {
    const sale = await this.saleRepo.findOne({ 
      where: { id }, 
      relations: ['items'] 
    });
    
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    // Restore stock for all items in the sale
    for (const item of sale.items) {
      await this.incrementMedicineQuantity(item.medicineId, item.quantity);
    }

    // Delete the sale (items will be deleted by cascade)
    await this.saleRepo.delete(id);
  }
}


