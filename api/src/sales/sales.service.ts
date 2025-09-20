import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity.js';
import { SaleItem } from './entities/sale-item.entity.js';
import { CreateSaleDto } from './dto/create-sale.dto.js';
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
    });
    sale.items = dto.items.map((i) => this.itemRepo.create({
      medicineId: i.medicineId,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      totalPrice: i.quantity * Number(i.unitPrice),
    }));
    const subtotal = sale.items.reduce((s, it) => s + Number(it.totalPrice), 0);
    sale.totalAmount = subtotal - Number(sale.discount ?? 0) + Number(sale.tax ?? 0);
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
          const profitPerUnit = Number(item.medicine.sellingPrice) - Number(item.medicine.costPrice);
          return sum + (profitPerUnit * item.quantity);
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
}


