import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'John Doe' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'password123' })
  @Column({ nullable: true })
  password: string;

  @ApiProperty({ example: 'admin', enum: ['admin', 'manager', 'cashier'] })
  @Column({ type: 'enum', enum: ['admin', 'manager', 'cashier'], default: 'cashier' })
  role: 'admin' | 'manager' | 'cashier';

  @ApiPropertyOptional({ example: '+251911234567' })
  @Column({ nullable: true })
  phone?: string;

  @ApiPropertyOptional({ example: '123 Main St, City' })
  @Column({ nullable: true })
  address?: string;

  @ApiProperty({ example: true, default: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
