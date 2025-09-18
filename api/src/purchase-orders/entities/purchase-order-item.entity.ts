import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PurchaseOrder } from './purchase-order.entity';
import { Medicine } from '../../medicines/entities/medicine.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItem {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  purchaseOrderId: number;

  @ManyToOne(() => PurchaseOrder, (po) => po.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchaseOrderId' })
  purchaseOrder: PurchaseOrder;

  @ApiProperty()
  @Column()
  medicineId: number;

  @ManyToOne(() => Medicine, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'medicineId' })
  medicine: Medicine;

  @ApiProperty()
  @Column({ type: 'int' })
  quantity: number;
}


