import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { MedicineQueryDto } from './dto/medicine-query.dto';
import { Medicine } from './entities/medicine.entity';

@ApiTags('medicines')
@Controller('medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new medicine' })
  @ApiResponse({ status: 201, description: 'Medicine created successfully', type: Medicine })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'Conflict - medicine name already exists' })
  create(@Body() createMedicineDto: CreateMedicineDto) {
    return this.medicinesService.create(createMedicineDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medicines with pagination and filters' })
  @ApiResponse({ 
    status: 200, 
    description: 'Medicines retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        medicines: { type: 'array', items: { $ref: '#/components/schemas/Medicine' } },
        total: { type: 'number', example: 25 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 }
      }
    }
  })
  findAll(@Query() queryDto: MedicineQueryDto) {
    return this.medicinesService.findAll(queryDto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all medicine categories' })
  @ApiResponse({ 
    status: 200, 
    description: 'Categories retrieved successfully',
    schema: {
      type: 'array',
      items: { type: 'string' },
      example: ['Pain Relief', 'Antibiotic', 'Antihistamine']
    }
  })
  getCategories() {
    return this.medicinesService.getCategories();
  }

  @Get('manufacturers')
  @ApiOperation({ summary: 'Get all manufacturers' })
  @ApiResponse({ 
    status: 200, 
    description: 'Manufacturers retrieved successfully',
    schema: {
      type: 'array',
      items: { type: 'string' },
      example: ['ABC Pharmaceuticals', 'XYZ Corp', 'MediCare Ltd']
    }
  })
  getManufacturers() {
    return this.medicinesService.getManufacturers();
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Find medicine by barcode' })
  @ApiParam({ name: 'barcode', description: 'Medicine barcode', example: '1234567890123' })
  @ApiResponse({ status: 200, description: 'Medicine found', type: Medicine })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  findByBarcode(@Param('barcode') barcode: string) {
    return this.medicinesService.findByBarcode(barcode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medicine by ID' })
  @ApiParam({ name: 'id', description: 'Medicine ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Medicine found', type: Medicine })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medicinesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update medicine' })
  @ApiParam({ name: 'id', description: 'Medicine ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Medicine updated successfully', type: Medicine })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  @ApiResponse({ status: 409, description: 'Conflict - medicine name already exists' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMedicineDto: UpdateMedicineDto) {
    return this.medicinesService.update(id, updateMedicineDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete medicine' })
  @ApiParam({ name: 'id', description: 'Medicine ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Medicine deleted successfully' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete medicine due to existing inventory references' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medicinesService.remove(id);
  }
}
