import { Body, Controller, Get, Param, ParseIntPipe, Post, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-purchase-order.dto';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { UpdatePurchaseOrderStatusDto } from './dto/update-status.dto';

@ApiTags('purchase-orders')
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly service: PurchaseOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create purchase order' })
  @ApiResponse({ status: 201, type: PurchaseOrder })
  create(@Body() dto: CreatePurchaseOrderDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'List purchase orders' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status: status as any,
      search,
    });
  }

  @Post(':id/receive')
  @ApiOperation({ summary: 'Receive purchase order and create inventory' })
  receive(@Param('id', ParseIntPipe) id: number, @Body() dto: ReceivePurchaseOrderDto) {
    return this.service.receive(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update purchase order status' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePurchaseOrderStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }
}


