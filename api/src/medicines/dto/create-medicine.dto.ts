import { IsString, IsOptional, MinLength, IsNotEmpty, IsInt, IsNumber, IsDateString, IsBoolean, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'expiryDateAfterManufacturingDate', async: false })
export class ExpiryDateAfterManufacturingDateConstraint implements ValidatorConstraintInterface {
  validate(expiryDate: string, args: ValidationArguments) {
    const object = args.object as any;
    const manufacturingDate = object.manufacturingDate;
    
    if (!expiryDate || !manufacturingDate) {
      return true; // Let other validators handle required fields
    }
    
    const expiry = new Date(expiryDate);
    const manufacturing = new Date(manufacturingDate);
    
    return expiry > manufacturing;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Expiry date must be ahead of manufacturing date';
  }
}

export class CreateMedicineDto {
  @ApiProperty({
    description: 'Name of the medicine',
    example: 'Paracetamol 500mg',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;


  @ApiProperty({ description: 'Category id for relation', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;


  @ApiPropertyOptional({
    description: 'Barcode of the medicine',
    example: '1234567890123',
  })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({
    description: 'Quantity in stock',
    example: 100,
    default: 0,
  })
  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    description: 'Unit of measurement',
    example: 'tablet',
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    description: 'Selling price per unit in ETB',
    example: 25.50,
    default: 0,
  })
  @IsNumber()
  @Type(() => Number)
  sellingPrice: number;

  @ApiProperty({
    description: 'Cost price per unit in ETB',
    example: 15.00,
    default: 0,
  })
  @IsNumber()
  @Type(() => Number)
  costPrice: number;

  @ApiProperty({
    description: 'Expiry date',
    example: '2025-12-31',
  })
  @IsDateString()
  @Validate(ExpiryDateAfterManufacturingDateConstraint)
  expiryDate: string;

  @ApiPropertyOptional({
    description: 'Manufacturing date',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  manufacturingDate?: string;

  @ApiPropertyOptional({
    description: 'Whether the medicine is visible on public website',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPublic?: boolean;

}
