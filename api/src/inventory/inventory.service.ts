import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, Like, FindManyOptions } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { InventoryStatus } from './entities/inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    // Check if batch number already exists
    const existingInventory = await this.inventoryRepository.findOne({
      where: { batchNumber: createInventoryDto.batchNumber },
    });

    if (existingInventory) {
      throw new BadRequestException('Batch number already exists');
    }

    const inventory = this.inventoryRepository.create({
      ...createInventoryDto,
      expiryDate: new Date(createInventoryDto.expiryDate),
      purchaseDate: new Date(createInventoryDto.purchaseDate),
    });

    return await this.inventoryRepository.save(inventory);
  }

  async findAll(queryDto: InventoryQueryDto): Promise<{ inventory: Inventory[]; total: number; page: number; limit: number }> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      medicineId, 
      batchNumber, 
      status, 
      location, 
      supplierId, 
      expiryDateFrom, 
      expiryDateTo 
    } = queryDto;
    
    const options: FindManyOptions<Inventory> = {
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['medicine'],
    };

    if (search || medicineId || batchNumber || status || location || supplierId || expiryDateFrom || expiryDateTo) {
      options.where = {};

      if (medicineId) {
        options.where = { ...options.where, medicineId };
      }

      if (batchNumber) {
        options.where = { ...options.where, batchNumber: Like(`%${batchNumber}%`) };
      }

      if (status) {
        options.where = { ...options.where, status };
      }

      if (location) {
        options.where = { ...options.where, location: Like(`%${location}%`) };
      }

      if (supplierId) {
        options.where = { ...options.where, supplierId };
      }

      if (expiryDateFrom && expiryDateTo) {
        options.where = { 
          ...options.where, 
          expiryDate: Between(new Date(expiryDateFrom), new Date(expiryDateTo)) 
        };
      } else if (expiryDateFrom) {
        options.where = { 
          ...options.where, 
          expiryDate: Between(new Date(expiryDateFrom), new Date('2099-12-31')) 
        };
      } else if (expiryDateTo) {
        options.where = { 
          ...options.where, 
          expiryDate: Between(new Date('1900-01-01'), new Date(expiryDateTo)) 
        };
      }

      if (search) {
        // Search in medicine name or batch number
        options.where = [
          { ...options.where, batchNumber: Like(`%${search}%`) },
          { ...options.where, medicine: { name: Like(`%${search}%`) } },
        ];
      }
    }

    const [inventory, total] = await this.inventoryRepository.findAndCount(options);

    return {
      inventory,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({ 
      where: { id },
      relations: ['medicine'],
    });
    
    if (!inventory) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    return inventory;
  }

  async update(id: number, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    const inventory = await this.findOne(id);

    // Check if updating batch number and it conflicts with existing inventory
    if (updateInventoryDto.batchNumber && updateInventoryDto.batchNumber !== inventory.batchNumber) {
      const existingInventory = await this.inventoryRepository.findOne({
        where: { batchNumber: updateInventoryDto.batchNumber },
      });

      if (existingInventory) {
        throw new BadRequestException('Batch number already exists');
      }
    }

    Object.assign(inventory, {
      ...updateInventoryDto,
      expiryDate: updateInventoryDto.expiryDate ? new Date(updateInventoryDto.expiryDate) : inventory.expiryDate,
      purchaseDate: updateInventoryDto.purchaseDate ? new Date(updateInventoryDto.purchaseDate) : inventory.purchaseDate,
    });

    return await this.inventoryRepository.save(inventory);
  }

  async remove(id: number): Promise<void> {
    const inventory = await this.findOne(id);
    await this.inventoryRepository.remove(inventory);
  }

  async getExpiringMedicines(days: number = 30): Promise<Inventory[]> {
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + days);

    return await this.inventoryRepository.find({
      where: {
        expiryDate: LessThan(expiryThreshold),
        status: InventoryStatus.ACTIVE,
      },
      relations: ['medicine'],
      order: { expiryDate: 'ASC' },
    });
  }

  async getLowStockItems(threshold: number = 10): Promise<Inventory[]> {
    return await this.inventoryRepository.find({
      where: {
        quantity: LessThan(threshold),
        status: InventoryStatus.ACTIVE,
      },
      relations: ['medicine'],
      order: { quantity: 'ASC' },
    });
  }

  async updateQuantity(id: number, quantityChange: number, reason: string): Promise<Inventory> {
    const inventory = await this.findOne(id);
    
    const newQuantity = inventory.quantity + quantityChange;
    if (newQuantity < 0) {
      throw new BadRequestException('Insufficient stock for this operation');
    }

    inventory.quantity = newQuantity;
    
    // Update status if quantity becomes 0
    if (newQuantity === 0) {
      inventory.status = InventoryStatus.SOLD_OUT;
    } else if (inventory.status === InventoryStatus.SOLD_OUT) {
      inventory.status = InventoryStatus.ACTIVE;
    }

    return await this.inventoryRepository.save(inventory);
  }

  async getInventorySummary(): Promise<{
    totalItems: number;
    totalValue: number;
    expiringItems: number;
    lowStockItems: number;
    activeItems: number;
  }> {
    const [totalItems, totalValue, expiringItems, lowStockItems, activeItems] = await Promise.all([
      this.inventoryRepository.count({ where: { status: InventoryStatus.ACTIVE } }),
      this.inventoryRepository
        .createQueryBuilder('inventory')
        .select('SUM(inventory.quantity * inventory.unitPrice)', 'total')
        .where('inventory.status = :status', { status: InventoryStatus.ACTIVE })
        .getRawOne(),
      this.inventoryRepository.count({
        where: {
          expiryDate: LessThan(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
          status: InventoryStatus.ACTIVE,
        },
      }),
      this.inventoryRepository.count({
        where: {
          quantity: LessThan(10),
          status: InventoryStatus.ACTIVE,
        },
      }),
      this.inventoryRepository.count({ where: { status: InventoryStatus.ACTIVE } }),
    ]);

    return {
      totalItems,
      totalValue: parseFloat(totalValue?.total || '0'),
      expiringItems,
      lowStockItems,
      activeItems,
    };
  }
}
