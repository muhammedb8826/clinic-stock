import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { Inventory } from './entities/inventory.entity';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Add new inventory item' })
  @ApiResponse({ status: 201, description: 'Inventory item created successfully', type: Inventory })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed or batch number exists' })
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory items with pagination and filters' })
  @ApiResponse({ 
    status: 200, 
    description: 'Inventory items retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        inventory: { type: 'array', items: { $ref: '#/components/schemas/Inventory' } },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 }
      }
    }
  })
  findAll(@Query() queryDto: InventoryQueryDto) {
    return this.inventoryService.findAll(queryDto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get inventory summary statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalItems: { type: 'number', example: 150 },
        totalValue: { type: 'number', example: 25000.50 },
        expiringItems: { type: 'number', example: 5 },
        lowStockItems: { type: 'number', example: 12 },
        activeItems: { type: 'number', example: 145 }
      }
    }
  })
  getSummary() {
    return this.inventoryService.getInventorySummary();
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get medicines expiring within specified days' })
  @ApiQuery({ name: 'days', description: 'Number of days to check for expiry', example: 30, required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Expiring medicines retrieved successfully',
    type: [Inventory]
  })
  getExpiringMedicines(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days) : 30;
    return this.inventoryService.getExpiringMedicines(daysNumber);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get items with low stock' })
  @ApiQuery({ name: 'threshold', description: 'Stock threshold', example: 10, required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Low stock items retrieved successfully',
    type: [Inventory]
  })
  getLowStockItems(@Query('threshold') threshold?: string) {
    const thresholdNumber = threshold ? parseInt(threshold) : 10;
    return this.inventoryService.getLowStockItems(thresholdNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  @ApiParam({ name: 'id', description: 'Inventory item ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Inventory item found', type: Inventory })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update inventory item' })
  @ApiParam({ name: 'id', description: 'Inventory item ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Inventory item updated successfully', type: Inventory })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  @ApiResponse({ status: 400, description: 'Bad request - batch number exists' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Patch(':id/quantity')
  @ApiOperation({ summary: 'Update inventory quantity' })
  @ApiParam({ name: 'id', description: 'Inventory item ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Quantity updated successfully', type: Inventory })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  @ApiResponse({ status: 400, description: 'Bad request - insufficient stock' })
  updateQuantity(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { quantityChange: number; reason: string },
  ) {
    return this.inventoryService.updateQuantity(id, body.quantityChange, body.reason);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete inventory item' })
  @ApiParam({ name: 'id', description: 'Inventory item ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Inventory item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.remove(id);
  }
}
