import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from '../../categories/entities/category.entity';

export enum MedicineForm {
  TABLET = 'tablet',
  CAPSULE = 'capsule',
  SYRUP = 'syrup',
  INJECTION = 'injection',
  CREAM = 'cream',
  DROPS = 'drops',
  PATCH = 'patch',
  POWDER = 'powder',
  OINTMENT = 'ointment',
  GEL = 'gel',
}

@Entity('medicines')
export class Medicine {
  @ApiProperty({ description: 'Unique identifier', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Name of the medicine', example: 'Paracetamol 500mg' })
  @Column({ unique: true })
  name: string;

  @ApiPropertyOptional({ description: 'Generic name of the medicine', example: 'Acetaminophen' })
  @Column({ nullable: true })
  genericName: string;

  @ApiProperty({ description: 'Dosage strength', example: '500mg' })
  @Column()
  dosage: string; // e.g., "500mg", "10ml"

  @ApiProperty({ description: 'Form of the medicine', enum: MedicineForm, example: MedicineForm.TABLET })
  @Column({
    type: 'enum',
    enum: MedicineForm,
  })
  form: MedicineForm;

  @ApiProperty({ description: 'Manufacturer', example: 'ABC Pharmaceuticals' })
  @Column()
  manufacturer: string;

  @ApiProperty({ description: 'Category id' })
  @Column({ nullable: true })
  categoryId: number;

  @ApiPropertyOptional({ description: 'Category relation' })
  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category?: Category;

  @ApiProperty({ description: 'Whether prescription is required', example: false })
  @Column({ default: true })
  prescriptionRequired: boolean;

  @ApiPropertyOptional({ description: 'Description', example: 'Pain reliever and fever reducer' })
  @Column({ nullable: true })
  description: string;

  @ApiPropertyOptional({ description: 'Barcode', example: '1234567890123' })
  @Column({ nullable: true })
  barcode: string;

  @ApiProperty({ description: 'Whether the medicine is active', example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp', example: '2024-01-15T10:30:00Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp', example: '2024-01-15T10:30:00Z' })
  @UpdateDateColumn()
  updatedAt: Date;
}
