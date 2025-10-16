import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostsService } from './costs.service';
import { CostsController } from './costs.controller';
import { Cost } from './entities/cost.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cost])],
  providers: [CostsService],
  controllers: [CostsController],
  exports: [CostsService],
})
export class CostsModule {}
