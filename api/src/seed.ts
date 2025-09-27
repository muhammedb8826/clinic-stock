import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';

import { Category } from './categories/entities/category.entity';
import { Supplier } from './suppliers/entities/supplier.entity';
import { Customer } from './customers/entities/customer.entity';
import { User } from './users/entities/user.entity';
import { Medicine } from './medicines/entities/medicine.entity';
import { Inventory, InventoryStatus } from './inventory/entities/inventory.entity';

async function upsert<T extends { id?: number }>(repo: Repository<T>, partials: Partial<T>[], uniqueKeys: (keyof T)[]) {
  for (const partial of partials) {
    const where: any = {};
    for (const k of uniqueKeys) where[k as string] = (partial as any)[k as string];
    let entity = await repo.findOne({ where });
    if (!entity) {
      entity = repo.create(partial as T);
    } else {
      Object.assign(entity, partial);
    }
    await repo.save(entity);
  }
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'error', 'warn'] });

  try {
    const categoryRepo = app.get<Repository<Category>>(getRepositoryToken(Category));
    const supplierRepo = app.get<Repository<Supplier>>(getRepositoryToken(Supplier));
    const customerRepo = app.get<Repository<Customer>>(getRepositoryToken(Customer));
    const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
    const medicineRepo = app.get<Repository<Medicine>>(getRepositoryToken(Medicine));
    const inventoryRepo = app.get<Repository<Inventory>>(getRepositoryToken(Inventory));

    // Categories
    const categoriesSeed: Array<Partial<Category>> = [
      { name: 'Pain Relief', description: 'Analgesics and antipyretics', isActive: true },
      { name: 'Antibiotics', description: 'Bacterial infection treatment', isActive: true },
      { name: 'Vitamins', description: 'Supplements and multivitamins', isActive: true },
      { name: 'Cough & Cold', description: 'Cough syrups, decongestants', isActive: true },
    ];
    await upsert(categoryRepo, categoriesSeed, ['name']);

    const categories = await categoryRepo.find();
    const categoryByName = Object.fromEntries(categories.map(c => [c.name, c]));

    // Suppliers
    const suppliersSeed: Array<Partial<Supplier>> = [
      { name: 'Ethiomed Pharma', email: 'contact@ethiomed.et', phone: '+251911000001', isActive: true },
      { name: 'Addis Pharma', email: 'sales@addispharma.et', phone: '+251911000002', isActive: true },
    ];
    await upsert(supplierRepo, suppliersSeed, ['name']);

    // Customers
    const customersSeed: Array<Partial<Customer>> = [
      { name: 'Walk-in Customer' },
      { name: 'City Clinic', email: 'clinic@example.com', phone: '+251911123456', address: 'Bole, Addis Ababa' },
    ];
    await upsert(customerRepo, customersSeed, ['name']);

    // Users
    const defaultUsers: Array<Partial<User>> = [
      { name: 'Admin User', email: 'admin@example.com', role: 'admin', isActive: true, password: await bcrypt.hash('password123', 12) },
      { name: 'Store Manager', email: 'manager@example.com', role: 'manager', isActive: true, password: await bcrypt.hash('password123', 12) },
      { name: 'Cashier One', email: 'cashier@example.com', role: 'cashier', isActive: true, password: await bcrypt.hash('password123', 12) },
    ];
    await upsert(userRepo, defaultUsers, ['email']);

    // Medicines
    const medicinesSeed: Array<Partial<Medicine>> = [
      {
        name: 'Paracetamol 500mg',
        categoryId: categoryByName['Pain Relief']?.id,
        barcode: '1111111111111',
        quantity: 0,
        sellingPrice: 25.5 as any,
        costPrice: 15.0 as any,
        expiryDate: new Date('2026-12-31'),
        manufacturingDate: new Date('2024-01-01'),
        isActive: true,
      },
      {
        name: 'Amoxicillin 500mg',
        categoryId: categoryByName['Antibiotics']?.id,
        barcode: '2222222222222',
        quantity: 0,
        sellingPrice: 75.0 as any,
        costPrice: 50.0 as any,
        expiryDate: new Date('2026-06-30'),
        manufacturingDate: new Date('2024-03-01'),
        isActive: true,
      },
      {
        name: 'Vitamin C 1000mg',
        categoryId: categoryByName['Vitamins']?.id,
        barcode: '3333333333333',
        quantity: 0,
        sellingPrice: 40.0 as any,
        costPrice: 20.0 as any,
        expiryDate: new Date('2027-01-31'),
        manufacturingDate: new Date('2024-02-01'),
        isActive: true,
      },
    ];
    await upsert(medicineRepo, medicinesSeed, ['name']);

    const medicines = await medicineRepo.find();
    const medicineByName = Object.fromEntries(medicines.map(m => [m.name, m]));

    // Inventory
    const inventorySeed: Array<Partial<Inventory>> = [
      {
        medicineId: medicineByName['Paracetamol 500mg'].id,
        batchNumber: 'PARA-B001',
        quantity: 200,
        sellingPrice: 25.5 as any,
        expiryDate: new Date('2026-12-31'),
        supplierId: 1,
        purchaseDate: new Date('2025-01-15'),
        location: 'Shelf A1',
        status: InventoryStatus.ACTIVE,
        notes: 'Initial stock',
      },
      {
        medicineId: medicineByName['Amoxicillin 500mg'].id,
        batchNumber: 'AMOX-B001',
        quantity: 150,
        sellingPrice: 75.0 as any,
        expiryDate: new Date('2026-06-30'),
        supplierId: 1,
        purchaseDate: new Date('2025-01-20'),
        location: 'Shelf B2',
        status: InventoryStatus.ACTIVE,
        notes: 'Initial stock',
      },
      {
        medicineId: medicineByName['Vitamin C 1000mg'].id,
        batchNumber: 'VITC-B001',
        quantity: 300,
        sellingPrice: 40.0 as any,
        expiryDate: new Date('2027-01-31'),
        supplierId: 2,
        purchaseDate: new Date('2025-01-22'),
        location: 'Shelf C1',
        status: InventoryStatus.ACTIVE,
        notes: 'Initial stock',
      },
    ];

    // ensure unique batch constraint safety
    for (const inv of inventorySeed) {
      const existing = await inventoryRepo.findOne({ where: { batchNumber: inv.batchNumber as string } });
      if (!existing) {
        await inventoryRepo.save(inventoryRepo.create(inv as Inventory));
      }
    }

    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap();


