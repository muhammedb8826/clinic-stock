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

    // Define admin users with correct password
    const adminUsersData = [
      { 
        name: 'Soreti Admin', 
        email: 'soreti@wanofi.com', 
        role: 'admin' as const, 
        isActive: true, 
        password: await bcrypt.hash('wanofi123', 10)
      },
      { 
        name: 'Ali Admin', 
        email: 'ali@wanofi.com', 
        role: 'admin' as const, 
        isActive: true, 
        password: await bcrypt.hash('wanofi123', 10)
      },
    ];

    console.log('Seeding admin users...');
    for (const userData of adminUsersData) {
      // Check if user exists
      let user = await userRepo.findOne({ where: { email: userData.email } });
      
      if (user) {
        // Update existing user with correct password hash
        console.log(`Updating existing user: ${userData.email}`);
        user.name = userData.name;
        user.role = userData.role;
        user.isActive = userData.isActive;
        user.password = userData.password;
        await userRepo.save(user);
        console.log(`Updated user: ${userData.name} (${userData.email})`);
      } else {
        // Create new user
        console.log(`Creating new user: ${userData.email}`);
        const newUser = userRepo.create({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          isActive: userData.isActive,
          password: userData.password
        });
        await userRepo.save(newUser);
        console.log(`Created user: ${userData.name} (${userData.email})`);
      }
    }

    console.log('\nDatabase seeding completed successfully.');
    console.log('Admin users ready:');
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