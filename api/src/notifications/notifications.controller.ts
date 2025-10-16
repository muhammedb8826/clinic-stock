import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({ status: 200, description: 'Test endpoint working' })
  test() {
    return { message: 'Notifications module is working', timestamp: new Date().toISOString() };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiResponse({ status: 200, description: 'Notification statistics retrieved successfully' })
  async getStats() {
    return await this.notificationsService.getNotificationStats();
  }

  @Post('check-inventory')
  @ApiOperation({ summary: 'Manually trigger inventory checks' })
  @ApiResponse({ status: 200, description: 'Inventory checks completed' })
  async checkInventory() {
    await this.notificationsService.runInventoryChecks();
    return { message: 'Inventory checks completed successfully' };
  }

  @Post('check-expired')
  @ApiOperation({ summary: 'Check for expired medicines' })
  @ApiResponse({ status: 200, description: 'Expired medicines check completed' })
  async checkExpired() {
    await this.notificationsService.checkExpiredMedicines();
    return { message: 'Expired medicines check completed' };
  }

  @Post('check-expiring-soon')
  @ApiOperation({ summary: 'Check for medicines expiring soon' })
  @ApiResponse({ status: 200, description: 'Expiring soon medicines check completed' })
  async checkExpiringSoon() {
    await this.notificationsService.checkExpiringSoonMedicines();
    return { message: 'Expiring soon medicines check completed' };
  }

  @Post('check-low-stock')
  @ApiOperation({ summary: 'Check for low stock medicines' })
  @ApiResponse({ status: 200, description: 'Low stock medicines check completed' })
  async checkLowStock() {
    await this.notificationsService.checkLowStockMedicines();
    return { message: 'Low stock medicines check completed' };
  }

  @Post('check-out-of-stock')
  @ApiOperation({ summary: 'Check for out of stock medicines' })
  @ApiResponse({ status: 200, description: 'Out of stock medicines check completed' })
  async checkOutOfStock() {
    await this.notificationsService.checkOutOfStockMedicines();
    return { message: 'Out of stock medicines check completed' };
  }
}

