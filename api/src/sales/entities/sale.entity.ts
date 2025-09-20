import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SaleItem } from './sale-item.entity';

@Entity('sales')
export class Sale {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  saleNumber: string;

  @ApiProperty()
  @Column({ type: 'date' })
  saleDate: Date;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  customerName?: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  customerPhone?: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @ApiPropertyOptional()
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @ApiPropertyOptional()
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax: number;

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items: SaleItem[];

  // Computed field for profit calculation
  calculatedProfit?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


