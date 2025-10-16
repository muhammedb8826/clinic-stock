import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationScheduler } from './notification-scheduler.service';
import { Medicine } from '../medicines/entities/medicine.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medicine]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsGateway, NotificationsService, NotificationScheduler],
  exports: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule {}
