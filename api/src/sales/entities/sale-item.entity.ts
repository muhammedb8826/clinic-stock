import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sale } from './sale.entity';
import { Medicine } from '../../medicines/entities/medicine.entity';

@Entity('sale_items')
export class SaleItem {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  saleId: number;

  @ManyToOne(() => Sale, (sale) => sale.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'saleId' })
  sale: Sale;

  @ApiProperty()
  @Column()
  medicineId: number;

  @ManyToOne(() => Medicine, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'medicineId' })
  medicine: Medicine;

  @ApiProperty()
  @Column({ type: 'int' })
  quantity: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalPrice: number;

  @ApiPropertyOptional()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;
}


