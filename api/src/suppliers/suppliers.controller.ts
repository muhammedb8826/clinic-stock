import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { Supplier } from './entities/supplier.entity';

@ApiTags('suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Get()
  list(): Promise<Supplier[]> {
    return this.service.list();
  }

  @Post()
  create(@Body() body: Partial<Supplier>) {
    return this.service.create(body);
  }
}


