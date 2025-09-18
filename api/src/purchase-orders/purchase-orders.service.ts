import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-purchase-order.dto';
import { Medicine } from '../medicines/entities/medicine.entity';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder) private readonly poRepo: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem) private readonly itemRepo: Repository<PurchaseOrderItem>,
    @InjectRepository(Medicine) private readonly medicineRepo: Repository<Medicine>,
  ) {}

  private generateOrderNumber(): string {
    const now = new Date();
    return `PO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 9000 + 1000)}`;
  }

  async create(dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const po = this.poRepo.create({
      orderNumber: this.generateOrderNumber(),
      supplierId: dto.supplierId,
      status: dto.status ?? PurchaseOrderStatus.DRAFT,
      orderDate: new Date(dto.orderDate),
      expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : undefined,
      notes: dto.notes,
    });

    po.items = dto.items.map((i) =>
      this.itemRepo.create({
        medicineId: i.medicineId,
        quantity: i.quantity,
      }),
    );
    return this.poRepo.save(po);
  }

  async findAll(query?: { page?: number; limit?: number; status?: PurchaseOrderStatus; search?: string }): Promise<{ purchaseOrders: PurchaseOrder[]; total: number; page: number; limit: number }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;

    const qb = this.poRepo
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.supplier', 'supplier')
      .leftJoinAndSelect('po.items', 'items')
      .orderBy('po.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query?.status) {
      qb.andWhere('po.status = :status', { status: query.status });
    }
    if (query?.search) {
      qb.andWhere('(po.orderNumber ILIKE :q OR supplier.name ILIKE :q)', { q: `%${query.search}%` });
    }

    const [purchaseOrders, total] = await qb.getManyAndCount();
    return { purchaseOrders, total, page, limit };
  }

  async findOne(id: number): Promise<PurchaseOrder> {
    const po = await this.poRepo.findOne({ where: { id }, relations: { items: true, supplier: true } });
    if (!po) throw new NotFoundException('Purchase order not found');
    return po;
  }

  async receive(id: number, dto: ReceivePurchaseOrderDto): Promise<PurchaseOrder> {
    const po = await this.poRepo.findOne({ where: { id }, relations: { items: true } });
    if (!po) throw new NotFoundException('Purchase order not found');
    if (po.status === PurchaseOrderStatus.RECEIVED) throw new BadRequestException('Already received');

    const itemMap = new Map<number, PurchaseOrderItem>(po.items.map((it) => [it.id, it]));
    
    // Group received items by medicine ID to handle multiple items for same medicine
    const medicineUpdates = new Map<number, { 
      quantity: number; 
      sellingPriceSum: number; 
      sellingPriceCount: number;
      earliestExpiryDate: Date; 
      manufacturingDate: Date 
    }>();
    
    for (const r of dto.items) {
      const item = itemMap.get(r.purchaseOrderItemId);
      if (!item) throw new BadRequestException(`Invalid item id ${r.purchaseOrderItemId}`);
      if (r.quantityReceived < 1 || r.quantityReceived > item.quantity) throw new BadRequestException('Invalid quantity');

      const medicineId = item.medicineId;
      const existing = medicineUpdates.get(medicineId);
      const currentExpiryDate = new Date(r.expiryDate);
      
      if (existing) {
        // If medicine already exists in updates, accumulate quantity and average selling price
        existing.quantity += r.quantityReceived;
        existing.sellingPriceSum += r.sellingPrice;
        existing.sellingPriceCount += 1;
        // Use the earliest expiry date (most conservative approach)
        if (currentExpiryDate < existing.earliestExpiryDate) {
          existing.earliestExpiryDate = currentExpiryDate;
        }
      } else {
        // First time seeing this medicine in this receive
        medicineUpdates.set(medicineId, {
          quantity: r.quantityReceived,
          sellingPriceSum: r.sellingPrice,
          sellingPriceCount: 1,
          earliestExpiryDate: currentExpiryDate,
          manufacturingDate: new Date(dto.receivedDate)
        });
      }
    }

    // Apply all medicine updates
    for (const [medicineId, update] of medicineUpdates) {
      const medicine = await this.medicineRepo.findOne({ where: { id: medicineId } });
      if (!medicine) throw new BadRequestException(`Medicine not found for id ${medicineId}`);
      
      medicine.quantity += update.quantity;
      // Calculate average selling price
      medicine.sellingPrice = update.sellingPriceSum / update.sellingPriceCount;
      // Use the earliest expiry date (most conservative approach)
      medicine.expiryDate = update.earliestExpiryDate;
      medicine.manufacturingDate = update.manufacturingDate;
      
      await this.medicineRepo.save(medicine);
    }

    po.status = PurchaseOrderStatus.RECEIVED;
    po.receivedDate = new Date(dto.receivedDate);
    return this.poRepo.save(po);
  }

  async updateStatus(id: number, status: PurchaseOrderStatus): Promise<PurchaseOrder> {
    const po = await this.poRepo.findOne({ where: { id }, relations: { items: true } });
    if (!po) throw new NotFoundException('Purchase order not found');
    if (po.status === PurchaseOrderStatus.RECEIVED && status !== PurchaseOrderStatus.RECEIVED) {
      throw new BadRequestException('Cannot change status of a received PO');
    }
    
    // If changing to received status, automatically update medicine quantities
    if (status === PurchaseOrderStatus.RECEIVED && po.status !== PurchaseOrderStatus.RECEIVED) {
      // Group items by medicine ID to handle multiple items for same medicine
      const medicineUpdates = new Map<number, number>();
      
      for (const item of po.items) {
        const existing = medicineUpdates.get(item.medicineId);
        medicineUpdates.set(item.medicineId, (existing || 0) + item.quantity);
      }

      // Update medicine quantities
      for (const [medicineId, totalQuantity] of medicineUpdates) {
        const medicine = await this.medicineRepo.findOne({ where: { id: medicineId } });
        if (medicine) {
          medicine.quantity += totalQuantity;
          await this.medicineRepo.save(medicine);
        }
      }
      
      po.status = PurchaseOrderStatus.RECEIVED;
      po.receivedDate = new Date();
      return this.poRepo.save(po);
    }
    
    po.status = status;
    return this.poRepo.save(po);
  }
}


