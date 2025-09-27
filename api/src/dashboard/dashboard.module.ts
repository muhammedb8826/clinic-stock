import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Medicine } from '../medicines/entities/medicine.entity';
import { Sale } from '../sales/entities/sale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medicine, Sale])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
