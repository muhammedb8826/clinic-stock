import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean, MinLength, ValidateIf } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ example: 'ABC Pharmaceuticals' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @ApiPropertyOptional({ example: 'contact@abcpharma.com' })
  @ValidateIf((o) => o.email && o.email.trim() !== '')
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @ApiPropertyOptional({ example: '+251911234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Addis Ababa, Ethiopia' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Net 30 days' })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
