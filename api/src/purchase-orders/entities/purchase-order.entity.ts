import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Supplier } from '../../suppliers/entities/supplier.entity.js';
import { PurchaseOrderItem } from './purchase-order-item.entity.js';

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  ORDERED = 'ordered',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

@Entity('purchase_orders')
export class PurchaseOrder {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Generated order number' })
  @Column({ unique: true })
  orderNumber: string;

  @ApiProperty()
  @Column()
  supplierId: number;

  @ManyToOne(() => Supplier, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @ApiProperty({ enum: PurchaseOrderStatus })
  @Column({ type: 'enum', enum: PurchaseOrderStatus, default: PurchaseOrderStatus.DRAFT })
  status: PurchaseOrderStatus;

  @ApiProperty()
  @Column({ type: 'date' })
  orderDate: Date;

  @ApiPropertyOptional()
  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate?: Date;

  @ApiPropertyOptional()
  @Column({ type: 'date', nullable: true })
  receivedDate?: Date;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder, { cascade: true })
  items: PurchaseOrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


