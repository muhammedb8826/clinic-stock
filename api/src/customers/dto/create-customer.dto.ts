import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MinLength, ValidateIf } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
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
}
