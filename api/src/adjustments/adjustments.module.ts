import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdjustmentsService } from './adjustments.service';
import { AdjustmentsController } from './adjustments.controller';
import { StockAdjustment } from './entities/stock-adjustment.entity';
import { Inventory } from '../inventory/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockAdjustment, Inventory])],
  providers: [AdjustmentsService],
  controllers: [AdjustmentsController],
})
export class AdjustmentsModule {}


