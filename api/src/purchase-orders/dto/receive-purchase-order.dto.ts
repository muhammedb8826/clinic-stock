import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsNotEmpty, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReceiveItemDto {
  @ApiProperty()
  @IsInt()
  purchaseOrderItemId: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantityReceived: number;

  @ApiProperty()
  @IsNotEmpty()
  batchNumber: string;

  @ApiProperty()
  @IsDateString()
  expiryDate: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  sellingPrice: number;
}

export class ReceivePurchaseOrderDto {
  @ApiProperty()
  @IsDateString()
  receivedDate: string;

  @ApiProperty({ type: [ReceiveItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiveItemDto)
  items: ReceiveItemDto[];
}


