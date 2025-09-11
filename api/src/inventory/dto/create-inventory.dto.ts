import { IsString, IsNumber, IsDateString, IsEnum, IsOptional, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryStatus } from '../entities/inventory.entity';

export class CreateInventoryDto {
  @ApiProperty({ description: 'Medicine ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  medicineId: number;

  @ApiProperty({ description: 'Unique batch number', example: 'BATCH001' })
  @IsString()
  @IsNotEmpty()
  batchNumber: string;

  @ApiProperty({ description: 'Quantity in stock', example: 100, minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Unit purchase price', example: 0.50, minimum: 0 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: 'Selling price per unit', example: 1.00, minimum: 0 })
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @ApiProperty({ description: 'Expiry date', example: '2025-12-31' })
  @IsDateString()
  expiryDate: string;

  @ApiPropertyOptional({ description: 'Supplier ID', example: 1 })
  @IsOptional()
  @IsNumber()
  supplierId?: number;

  @ApiProperty({ description: 'Purchase date', example: '2024-01-15' })
  @IsDateString()
  purchaseDate: string;

  @ApiPropertyOptional({ description: 'Storage location', example: 'Shelf A1' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Inventory status', enum: InventoryStatus, example: InventoryStatus.ACTIVE })
  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Initial stock' })
  @IsOptional()
  @IsString()
  notes?: string;
}
