import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  // Run inventory checks every hour
  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyInventoryCheck() {
    this.logger.log('Running hourly inventory check...');
    await this.notificationsService.runInventoryChecks();
  }

  // Run inventory checks every day at 9 AM
  @Cron('0 9 * * *')
  async handleDailyInventoryCheck() {
    this.logger.log('Running daily inventory check...');
    await this.notificationsService.runInventoryChecks();
  }

  // Run inventory checks every Monday at 8 AM
  @Cron('0 8 * * 1')
  async handleWeeklyInventoryCheck() {
    this.logger.log('Running weekly inventory check...');
    await this.notificationsService.runInventoryChecks();
  }

  // Run expired medicines check every 6 hours
  @Cron('0 */6 * * *')
  async handleExpiredMedicinesCheck() {
    this.logger.log('Running expired medicines check...');
    await this.notificationsService.checkExpiredMedicines();
  }

  // Run expiring soon check every 12 hours
  @Cron('0 */12 * * *')
  async handleExpiringSoonCheck() {
    this.logger.log('Running expiring soon medicines check...');
    await this.notificationsService.checkExpiringSoonMedicines();
  }

  // Run stock checks every 2 hours
  @Cron('0 */2 * * *')
  async handleStockChecks() {
    this.logger.log('Running stock checks...');
    await Promise.all([
      this.notificationsService.checkLowStockMedicines(),
      this.notificationsService.checkOutOfStockMedicines(),
    ]);
  }
}

