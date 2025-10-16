import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('costs')
export class Cost {
  @ApiProperty({ description: 'Unique identifier', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Cost description', example: 'Monthly rent payment' })
  @Column()
  description: string;

  @ApiProperty({ description: 'Cost category', example: 'Rent' })
  @Column()
  category: string;

  @ApiProperty({ description: 'Cost amount in ETB', example: 5000.00 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Cost date', example: '2024-01-15' })
  @Column({ type: 'date' })
  costDate: Date;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Office rent for January' })
  @Column({ nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Whether the cost is active', example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp', example: '2024-01-15T10:30:00Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp', example: '2024-01-15T10:30:00Z' })
  @UpdateDateColumn()
  updatedAt: Date;
}
