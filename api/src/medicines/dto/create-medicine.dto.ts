import { IsString, IsOptional, MinLength, IsNotEmpty, IsInt, IsNumber, IsDateString, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
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

  @ApiProperty({
    description: 'Manufacturing date',
    example: '2024-01-15',
  })
  @IsDateString()
  manufacturingDate: string;

}
