import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('customers')
export class Customer {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  name: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  email?: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  phone?: string;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  address?: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
