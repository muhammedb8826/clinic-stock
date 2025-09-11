import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesService } from './sales.service.js';
import { SalesController } from './sales.controller.js';
import { Sale } from './entities/sale.entity.js';
import { SaleItem } from './entities/sale-item.entity.js';
import { Inventory } from '../inventory/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem, Inventory])],
  providers: [SalesService],
  controllers: [SalesController],
})
export class SalesModule {}


