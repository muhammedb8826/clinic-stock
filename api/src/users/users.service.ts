import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  async list(): Promise<User[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async create(data: CreateUserDto): Promise<User> {
    try {
      const entityData: any = { 
        ...data, 
        isActive: data.isActive ?? true 
      };

      // Only hash password if provided
      if (data.password) {
        entityData.password = await bcrypt.hash(data.password, 12);
      }

      const entity = this.repo.create(entityData);
      const savedEntity = await this.repo.save(entity);
      return Array.isArray(savedEntity) ? savedEntity[0] : savedEntity;
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        if (error.detail.includes('name')) {
          throw new ConflictException('User with this name already exists');
        } else if (error.detail.includes('email')) {
          throw new ConflictException('User with this email already exists');
        }
        throw new ConflictException('User with this information already exists');
      }
      throw error;
    }
  }

  async findOne(id: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    try {
      const updateData = { ...updateUserDto };
      
      // Hash password if provided
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 12);
      }
      
      Object.assign(user, updateData);
      return await this.repo.save(user);
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        if (error.detail.includes('name')) {
          throw new ConflictException('User with this name already exists');
        } else if (error.detail.includes('email')) {
          throw new ConflictException('User with this email already exists');
        }
        throw new ConflictException('User with this information already exists');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.repo.remove(user);
  }
}
