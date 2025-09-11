import { IsString, IsEnum, IsBoolean, IsOptional, MinLength, IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicineForm } from '../entities/medicine.entity';

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

  @ApiPropertyOptional({
    description: 'Generic name of the medicine',
    example: 'Acetaminophen',
  })
  @IsOptional()
  @IsString()
  genericName?: string;

  @ApiProperty({
    description: 'Dosage strength of the medicine',
    example: '500mg',
  })
  @IsString()
  @IsNotEmpty()
  dosage: string;

  @ApiProperty({
    description: 'Form of the medicine',
    enum: MedicineForm,
    example: MedicineForm.TABLET,
  })
  @IsEnum(MedicineForm)
  form: MedicineForm;

  @ApiProperty({
    description: 'Manufacturer of the medicine',
    example: 'ABC Pharmaceuticals',
  })
  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @ApiProperty({ description: 'Category id for relation', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Whether prescription is required',
    example: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  prescriptionRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Description of the medicine',
    example: 'Pain reliever and fever reducer',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Barcode of the medicine',
    example: '1234567890123',
  })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Whether the medicine is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
