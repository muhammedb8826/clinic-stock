import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity.js';
import { SaleItem } from './entities/sale-item.entity.js';
import { CreateSaleDto } from './dto/create-sale.dto.js';
import { Inventory, InventoryStatus } from '../inventory/entities/inventory.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale) private readonly saleRepo: Repository<Sale>,
    @InjectRepository(SaleItem) private readonly itemRepo: Repository<SaleItem>,
    @InjectRepository(Inventory) private readonly invRepo: Repository<Inventory>,
  ) {}

  private generateSaleNumber(): string {
    const now = new Date();
    return `S-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 9000 + 1000)}`;
  }

  // FEFO: consume earliest expiry batches first
  private async decrementInventoryFefo(medicineId: number, quantity: number) {
    let remaining = quantity;
    const batches = await this.invRepo.find({ where: { medicineId, status: InventoryStatus.ACTIVE }, order: { expiryDate: 'ASC' } });
    for (const b of batches) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, b.quantity);
      b.quantity -= take;
      remaining -= take;
      if (b.quantity === 0) {
        b.status = InventoryStatus.SOLD_OUT;
      }
      await this.invRepo.save(b);
    }
    if (remaining > 0) throw new BadRequestException('Insufficient stock');
  }

  async create(dto: CreateSaleDto): Promise<Sale> {
    if (!dto.items?.length) throw new BadRequestException('No items');
    for (const it of dto.items) {
      await this.decrementInventoryFefo(it.medicineId, it.quantity);
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
    return this.saleRepo.find({ order: { createdAt: 'DESC' } });
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
}


