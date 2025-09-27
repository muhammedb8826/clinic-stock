import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdjustmentsService } from './adjustments.service';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';

@ApiTags('adjustments')
@Controller('adjustments')
export class AdjustmentsController {
  constructor(private readonly service: AdjustmentsService) {}

  @Post()
  create(@Body() dto: CreateAdjustmentDto) {
    return this.service.create(dto);
  }

  @Get()
  list() {
    return this.service.list();
  }
}


