import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Inventory } from '../../inventory/entities/inventory.entity';

export enum AdjustmentType {
  DAMAGE = 'damage',
  THEFT = 'theft',
  EXPIRED = 'expired',
  CORRECTION = 'correction',
  RETURN = 'return',
}

@Entity('stock_adjustments')
export class StockAdjustment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  inventoryId: number;

  @ManyToOne(() => Inventory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventoryId' })
  inventory: Inventory;

  @ApiProperty({ enum: AdjustmentType })
  @Column({ type: 'enum', enum: AdjustmentType })
  adjustmentType: AdjustmentType;

  @ApiProperty({ description: 'Positive for increase, negative for decrease' })
  @Column({ type: 'int' })
  quantityChange: number;

  @ApiProperty()
  @Column()
  reason: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  adjustedBy?: number;

  @ApiProperty()
  @CreateDateColumn()
  adjustmentDate: Date;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  notes?: string;
}


