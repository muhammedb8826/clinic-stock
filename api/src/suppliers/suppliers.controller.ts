import { Body, Controller, Get, Post, Put, Patch, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@ApiTags('suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({ status: 200, description: 'List of suppliers' })
  list(): Promise<Supplier[]> {
    return this.service.list();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() body: CreateSupplierDto) {
    return this.service.create(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supplier by ID' })
  @ApiResponse({ status: 200, description: 'Supplier found' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a supplier' })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.service.update(+id, updateSupplierDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a supplier (PATCH)' })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  patch(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.service.update(+id, updateSupplierDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a supplier' })
  @ApiResponse({ status: 200, description: 'Supplier deleted successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}


