import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleItemDto {
  @ApiProperty()
  @IsInt()
  medicineId: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateSaleDto {
  @ApiProperty()
  @IsDateString()
  saleDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  customerPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  tax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ type: [CreateSaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}


