import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdjustmentsService } from './adjustments.service.js';
import { AdjustmentsController } from './adjustments.controller.js';
import { StockAdjustment } from './entities/stock-adjustment.entity.js';
import { Inventory } from '../inventory/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockAdjustment, Inventory])],
  providers: [AdjustmentsService],
  controllers: [AdjustmentsController],
})
export class AdjustmentsModule {}


