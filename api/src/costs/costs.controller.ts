import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CostsService } from './costs.service';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateCostDto } from './dto/update-cost.dto';
import { CostQueryDto } from './dto/cost-query.dto';
import { Cost } from './entities/cost.entity';

@ApiTags('costs')
@Controller('costs')
export class CostsController {
  constructor(private readonly costsService: CostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new cost entry' })
  @ApiResponse({ status: 201, description: 'Cost created successfully', type: Cost })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  create(@Body() createCostDto: CreateCostDto) {
    return this.costsService.create(createCostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all costs with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Costs retrieved successfully' })
  findAll(@Query() query: CostQueryDto) {
    return this.costsService.findAll(query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all cost categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  getCategories() {
    return this.costsService.getCategories();
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get costs by date range' })
  @ApiResponse({ status: 200, description: 'Costs retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date (ISO string)' })
  getCostsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.costsService.getCostsByDateRange(startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a cost by ID' })
  @ApiResponse({ status: 200, description: 'Cost retrieved successfully', type: Cost })
  @ApiResponse({ status: 404, description: 'Cost not found' })
  @ApiParam({ name: 'id', description: 'Cost ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.costsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a cost' })
  @ApiResponse({ status: 200, description: 'Cost updated successfully', type: Cost })
  @ApiResponse({ status: 404, description: 'Cost not found' })
  @ApiParam({ name: 'id', description: 'Cost ID' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCostDto: UpdateCostDto) {
    return this.costsService.update(id, updateCostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a cost (soft delete)' })
  @ApiResponse({ status: 200, description: 'Cost deleted successfully' })
  @ApiResponse({ status: 404, description: 'Cost not found' })
  @ApiParam({ name: 'id', description: 'Cost ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.costsService.remove(id);
  }
}
