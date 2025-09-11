import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Medicine } from '../../medicines/entities/medicine.entity';

export enum InventoryStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DAMAGED = 'damaged',
  RETURNED = 'returned',
  SOLD_OUT = 'sold_out',
}

@Entity('inventory')
export class Inventory {
  @ApiProperty({ description: 'Unique identifier', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Medicine ID', example: 1 })
  @Column()
  medicineId: number;

  @ApiProperty({ description: 'Medicine details', type: () => Medicine })
  @ManyToOne(() => Medicine)
  @JoinColumn({ name: 'medicineId' })
  medicine: Medicine;

  @ApiProperty({ description: 'Unique batch number', example: 'BATCH001' })
  @Column({ unique: true })
  batchNumber: string;

  @ApiProperty({ description: 'Quantity in stock', example: 100 })
  @Column({ type: 'int' })
  quantity: number;

  @ApiProperty({ description: 'Unit purchase price', example: 0.50 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @ApiProperty({ description: 'Selling price per unit', example: 1.00 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sellingPrice: number;

  @ApiProperty({ description: 'Expiry date', example: '2025-12-31' })
  @Column({ type: 'date' })
  expiryDate: Date;

  @ApiPropertyOptional({ description: 'Supplier ID', example: 1 })
  @Column({ nullable: true })
  supplierId: number;

  @ApiProperty({ description: 'Purchase date', example: '2024-01-15' })
  @Column({ type: 'date' })
  purchaseDate: Date;

  @ApiPropertyOptional({ description: 'Storage location', example: 'Shelf A1' })
  @Column({ nullable: true })
  location: string; // shelf, storage room, etc.

  @ApiProperty({ description: 'Inventory status', enum: InventoryStatus, example: InventoryStatus.ACTIVE })
  @Column({
    type: 'enum',
    enum: InventoryStatus,
    default: InventoryStatus.ACTIVE,
  })
  status: InventoryStatus;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Initial stock' })
  @Column({ nullable: true })
  notes: string;

  @ApiProperty({ description: 'Creation timestamp', example: '2024-01-15T10:30:00Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp', example: '2024-01-15T10:30:00Z' })
  @UpdateDateColumn()
  updatedAt: Date;
}
