import { IsString, IsOptional, IsNotEmpty, IsNumber, IsDateString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCostDto {
  @ApiProperty({
    description: 'Cost description',
    example: 'Monthly rent payment',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  description: string;

  @ApiProperty({
    description: 'Cost category',
    example: 'Rent',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  category: string;

  @ApiProperty({
    description: 'Cost amount in ETB',
    example: 5000.00,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Cost date',
    example: '2024-01-15',
  })
  @IsDateString()
  costDate: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Office rent for January',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
