import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesService } from './sales.service.js';
import { SalesController } from './sales.controller.js';
import { Sale } from './entities/sale.entity.js';
import { SaleItem } from './entities/sale-item.entity.js';
import { Medicine } from '../medicines/entities/medicine.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem, Medicine])],
  providers: [SalesService],
  controllers: [SalesController],
})
export class SalesModule {}


