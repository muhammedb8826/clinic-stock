import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, LessThanOrEqual, MoreThanOrEqual, Between, MoreThan } from 'typeorm';
import { Medicine } from '../medicines/entities/medicine.entity';
import { NotificationsGateway, NotificationPayload } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Medicine)
    private readonly medicineRepo: Repository<Medicine>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  // Check for expired medicines
  async checkExpiredMedicines(): Promise<void> {
    const today = new Date();
    const expiredMedicines = await this.medicineRepo.find({
      where: {
        isActive: true,
        expiryDate: LessThan(today),
      },
      relations: ['category'],
    });

    for (const medicine of expiredMedicines) {
      const notification: NotificationPayload = {
        type: 'expired',
        title: 'Medicine Expired',
        message: `${medicine.name} has expired on ${new Date(medicine.expiryDate).toLocaleDateString()}`,
        medicineId: medicine.id,
        medicineName: medicine.name,
        expiryDate: medicine.expiryDate.toString(),
        priority: 'urgent',
        timestamp: new Date().toISOString(),
      };

      this.notificationsGateway.broadcastNotification(notification);
    }

    if (expiredMedicines.length > 0) {
      this.logger.warn(`Found ${expiredMedicines.length} expired medicines`);
    }
  }

  // Check for medicines expiring soon (within 30 days)
  async checkExpiringSoonMedicines(): Promise<void> {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const expiringSoonMedicines = await this.medicineRepo.find({
      where: {
        isActive: true,
        expiryDate: Between(today, thirtyDaysFromNow),
      },
      relations: ['category'],
    });

    for (const medicine of expiringSoonMedicines) {
      const daysUntilExpiry = Math.ceil(
        (new Date(medicine.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      const notification: NotificationPayload = {
        type: 'expire_soon',
        title: 'Medicine Expiring Soon',
        message: `${medicine.name} will expire in ${daysUntilExpiry} days`,
        medicineId: medicine.id,
        medicineName: medicine.name,
        expiryDate: medicine.expiryDate.toString(),
        priority: daysUntilExpiry <= 7 ? 'high' : 'medium',
        timestamp: new Date().toISOString(),
      };

      this.notificationsGateway.broadcastNotification(notification);
    }

    if (expiringSoonMedicines.length > 0) {
      this.logger.warn(`Found ${expiringSoonMedicines.length} medicines expiring soon`);
    }
  }

  // Check for low stock medicines (quantity <= 10)
  async checkLowStockMedicines(): Promise<void> {
    const lowStockMedicines = await this.medicineRepo.find({
      where: {
        isActive: true,
        quantity: { $gt: 0, $lte: 10 } as any,
      },
      relations: ['category'],
    });

    for (const medicine of lowStockMedicines) {
      const notification: NotificationPayload = {
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: `${medicine.name} is running low (${medicine.quantity} ${medicine.unit || 'units'} remaining)`,
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity: medicine.quantity,
        priority: medicine.quantity <= 5 ? 'high' : 'medium',
        timestamp: new Date().toISOString(),
      };

      this.notificationsGateway.broadcastNotification(notification);
    }

    if (lowStockMedicines.length > 0) {
      this.logger.warn(`Found ${lowStockMedicines.length} medicines with low stock`);
    }
  }

  // Check for out of stock medicines
  async checkOutOfStockMedicines(): Promise<void> {
    const outOfStockMedicines = await this.medicineRepo.find({
      where: {
        isActive: true,
        quantity: 0,
      },
      relations: ['category'],
    });

    for (const medicine of outOfStockMedicines) {
      const notification: NotificationPayload = {
        type: 'out_of_stock',
        title: 'Out of Stock',
        message: `${medicine.name} is out of stock`,
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity: 0,
        priority: 'urgent',
        timestamp: new Date().toISOString(),
      };

      this.notificationsGateway.broadcastNotification(notification);
    }

    if (outOfStockMedicines.length > 0) {
      this.logger.warn(`Found ${outOfStockMedicines.length} out of stock medicines`);
    }
  }

  // Run all inventory checks
  async runInventoryChecks(): Promise<void> {
    this.logger.log('Running inventory checks...');
    
    try {
      await Promise.all([
        this.checkExpiredMedicines(),
        this.checkExpiringSoonMedicines(),
        this.checkLowStockMedicines(),
        this.checkOutOfStockMedicines(),
      ]);
      
      this.logger.log('Inventory checks completed');
    } catch (error) {
      this.logger.error('Error running inventory checks:', error);
    }
  }

  // Send custom notification
  async sendCustomNotification(notification: NotificationPayload): Promise<void> {
    this.notificationsGateway.broadcastNotification(notification);
    this.logger.log(`Custom notification sent: ${notification.type}`);
  }

  // Get notification statistics
  async getNotificationStats(): Promise<{
    expired: number;
    expiringSoon: number;
    lowStock: number;
    outOfStock: number;
    connectedClients: number;
  }> {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const [expired, expiringSoon, lowStock, outOfStock] = await Promise.all([
      this.medicineRepo.count({
        where: {
          isActive: true,
          expiryDate: LessThan(today),
        },
      }),
      this.medicineRepo.count({
        where: {
          isActive: true,
          expiryDate: Between(today, thirtyDaysFromNow),
        },
      }),
      this.medicineRepo.count({
        where: {
          isActive: true,
          quantity: Between(1, 10),
        },
      }),
      this.medicineRepo.count({
        where: {
          isActive: true,
          quantity: 0,
        },
      }),
    ]);

    return {
      expired,
      expiringSoon,
      lowStock,
      outOfStock,
      connectedClients: this.notificationsGateway.getConnectedClientsCount(),
    };
  }
}

