import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockAdjustment } from './entities/stock-adjustment.entity';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { Inventory, InventoryStatus } from '../inventory/entities/inventory.entity';

@Injectable()
export class AdjustmentsService {
  constructor(
    @InjectRepository(StockAdjustment) private readonly adjRepo: Repository<StockAdjustment>,
    @InjectRepository(Inventory) private readonly invRepo: Repository<Inventory>,
  ) {}

  async create(dto: CreateAdjustmentDto): Promise<StockAdjustment> {
    const inv = await this.invRepo.findOne({ where: { id: dto.inventoryId } });
    if (!inv) throw new BadRequestException('Inventory not found');

    const newQty = inv.quantity + dto.quantityChange;
    if (newQty < 0) throw new BadRequestException('Insufficient stock for adjustment');
    inv.quantity = newQty;
    if (inv.quantity === 0) inv.status = InventoryStatus.SOLD_OUT;
    if (inv.quantity > 0 && inv.status === InventoryStatus.SOLD_OUT) inv.status = InventoryStatus.ACTIVE;
    await this.invRepo.save(inv);

    const adj = this.adjRepo.create({ ...dto });
    return this.adjRepo.save(adj);
  }

  async list(): Promise<StockAdjustment[]> {
    return this.adjRepo.find({ order: { adjustmentDate: 'DESC' } });
  }
}


