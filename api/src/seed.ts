import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from './users/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'error', 'warn'] });

  try {
    const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

    // Clear all existing users
    console.log('Clearing existing users...');
    await userRepo.clear();

    // Create only the two admin users
    const adminUsers: Array<Partial<User>> = [
      { 
        name: 'Soreti Admin', 
        email: 'soreti@wanofi.com', 
        role: 'admin', 
        isActive: true, 
        password: await bcrypt.hash('wanofi123', 12) 
      },
      { 
        name: 'Ali Admin', 
        email: 'ali@wanofi.com', 
        role: 'admin', 
        isActive: true, 
        password: await bcrypt.hash('wanofi123', 12) 
      },
    ];

    console.log('Creating admin users...');
    for (const userData of adminUsers) {
      const user = userRepo.create(userData as User);
      await userRepo.save(user);
      console.log(`Created user: ${userData.name} (${userData.email})`);
    }

    console.log('Database seeding completed successfully.');
    console.log('Admin users created:');
    console.log('- soreti@wanofi.com (Password: wanofi123)');
    console.log('- ali@wanofi.com (Password: wanofi123)');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap();