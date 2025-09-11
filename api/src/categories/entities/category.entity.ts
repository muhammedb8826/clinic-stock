import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('categories')
export class Category {
  @ApiProperty({ description: 'Unique identifier', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Category name', example: 'Pain Relief' })
  @Column({ unique: true })
  name: string;

  @ApiPropertyOptional({ description: 'Category description', example: 'Analgesics and antipyretics' })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ description: 'Whether the category is active', example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}


