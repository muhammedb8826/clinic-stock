import { Body, Controller, Get, Post, Query, Put, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly service: SalesService) {}

  @Post()
  create(@Body() dto: CreateSaleDto) {
    return this.service.create(dto);
  }

  @Get()
  list() {
    return this.service.list();
  }

  @Get('reports/daily')
  reportDaily(@Query('start') start?: string, @Query('end') end?: string) {
    return this.service.reportDaily(start, end);
  }

  @Get('reports/monthly')
  reportMonthly(@Query('year') year?: string) {
    return this.service.reportMonthly(year ? parseInt(year) : undefined);
  }

  @Get('reports/weekly')
  reportWeekly(@Query('start') start?: string, @Query('end') end?: string) {
    return this.service.reportWeekly(start, end);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSaleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}


