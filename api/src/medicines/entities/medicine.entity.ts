import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from '../../categories/entities/category.entity';


@Entity('medicines')
export class Medicine {
  @ApiProperty({ description: 'Unique identifier', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Name of the medicine', example: 'Paracetamol 500mg' })
  @Column()
  name: string;


  @ApiProperty({ description: 'Category id' })
  @Column({ nullable: true })
  categoryId: number;

  @ApiPropertyOptional({ description: 'Category relation' })
  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category?: Category;


  @ApiPropertyOptional({ description: 'Barcode', example: '1234567890123' })
  @Column({ nullable: true })
  barcode: string;

  @ApiProperty({ description: 'Quantity in stock', example: 100 })
  @Column({ type: 'int', default: 0 })
  quantity: number;

  @ApiProperty({ description: 'Unit of measurement', example: 'tablet' })
  @Column({ nullable: true })
  unit: string;

  @ApiProperty({ description: 'Selling price per unit in ETB', example: 25.50 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  sellingPrice: number;

  @ApiProperty({ description: 'Cost price per unit in ETB', example: 15.00 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costPrice: number;

  @ApiProperty({ description: 'Expiry date', example: '2025-12-31' })
  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @ApiProperty({ description: 'Manufacturing date', example: '2024-01-15' })
  @Column({ type: 'date', nullable: true })
  manufacturingDate: Date;

  @ApiProperty({ description: 'Whether the medicine is active', example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Whether the medicine is visible on public website', example: true })
  @Column({ default: true })
  isPublic: boolean;

  @ApiProperty({ description: 'Creation timestamp', example: '2024-01-15T10:30:00Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp', example: '2024-01-15T10:30:00Z' })
  @UpdateDateColumn()
  updatedAt: Date;
}
