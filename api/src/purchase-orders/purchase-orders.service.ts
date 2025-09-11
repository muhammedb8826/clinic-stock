import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-purchase-order.dto';
import { Inventory } from '../inventory/entities/inventory.entity';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder) private readonly poRepo: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem) private readonly itemRepo: Repository<PurchaseOrderItem>,
    @InjectRepository(Inventory) private readonly invRepo: Repository<Inventory>,
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
        unitPrice: i.unitPrice,
        totalPrice: i.quantity * Number(i.unitPrice),
      }),
    );
    po.totalAmount = po.items.reduce((sum, it) => sum + Number(it.totalPrice), 0);
    return this.poRepo.save(po);
  }

  async findAll(query?: { page?: number; limit?: number; status?: PurchaseOrderStatus; search?: string }): Promise<{ purchaseOrders: PurchaseOrder[]; total: number; page: number; limit: number }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;

    const qb = this.poRepo
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.supplier', 'supplier')
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
    for (const r of dto.items) {
      const item = itemMap.get(r.purchaseOrderItemId);
      if (!item) throw new BadRequestException(`Invalid item id ${r.purchaseOrderItemId}`);
      if (r.quantityReceived < 1 || r.quantityReceived > item.quantity) throw new BadRequestException('Invalid quantity');

      const inv = this.invRepo.create({
        medicineId: item.medicineId,
        batchNumber: r.batchNumber,
        quantity: r.quantityReceived,
        unitPrice: r.unitPrice,
        sellingPrice: r.sellingPrice,
        expiryDate: new Date(r.expiryDate),
        supplierId: po.supplierId,
        purchaseDate: new Date(dto.receivedDate),
      });
      await this.invRepo.save(inv);
    }

    po.status = PurchaseOrderStatus.RECEIVED;
    po.receivedDate = new Date(dto.receivedDate);
    return this.poRepo.save(po);
  }

  async updateStatus(id: number, status: PurchaseOrderStatus): Promise<PurchaseOrder> {
    const po = await this.poRepo.findOne({ where: { id } });
    if (!po) throw new NotFoundException('Purchase order not found');
    if (po.status === PurchaseOrderStatus.RECEIVED && status !== PurchaseOrderStatus.RECEIVED) {
      throw new BadRequestException('Cannot change status of a received PO');
    }
    po.status = status;
    return this.poRepo.save(po);
  }
}


