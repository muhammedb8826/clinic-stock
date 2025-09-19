import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthSeedService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async seedDefaultAdmin() {
    const adminExists = await this.usersRepository.findOne({
      where: { email: 'admin@example.com' }
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      const adminUser = this.usersRepository.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
      });

      await this.usersRepository.save(adminUser);
      console.log('Default admin user created: admin@example.com / password123');
    } else if (!adminExists.password) {
      // Update existing admin user with password
      const hashedPassword = await bcrypt.hash('password123', 12);
      adminExists.password = hashedPassword;
      await this.usersRepository.save(adminExists);
      console.log('Default admin user password updated: admin@example.com / password123');
    }

    // Update any existing users without passwords
    const usersWithoutPasswords = await this.usersRepository.find({
      where: { password: null as any }
    });

    for (const user of usersWithoutPasswords) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      user.password = hashedPassword;
      await this.usersRepository.save(user);
      console.log(`Updated password for user: ${user.email}`);
    }
  }
}
