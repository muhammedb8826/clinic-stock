import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { AdjustmentType } from '../entities/stock-adjustment.entity';

export class CreateAdjustmentDto {
  @ApiProperty()
  @IsInt()
  inventoryId: number;

  @ApiProperty({ enum: AdjustmentType })
  @IsEnum(AdjustmentType)
  adjustmentType: AdjustmentType;

  @ApiProperty({ description: 'Positive to increase, negative to decrease' })
  @IsInt()
  quantityChange: number;

  @ApiProperty()
  @IsString()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  adjustedBy?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}


