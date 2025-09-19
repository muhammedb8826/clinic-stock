import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(@InjectRepository(Supplier) private readonly repo: Repository<Supplier>) {}

  async list(): Promise<Supplier[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async create(data: CreateSupplierDto): Promise<Supplier> {
    try {
      const entity = this.repo.create({ ...data, isActive: data.isActive ?? true });
      return await this.repo.save(entity);
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new ConflictException('Supplier with this name already exists');
      }
      throw error;
    }
  }

  async findOne(id: number): Promise<Supplier> {
    const supplier = await this.repo.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findOne(id);
    
    try {
      Object.assign(supplier, updateSupplierDto);
      return await this.repo.save(supplier);
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new ConflictException('Supplier with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const supplier = await this.findOne(id);
      await this.repo.remove(supplier);
    } catch (error) {
      if (error.code === '23503') { // Foreign key constraint violation
        throw new BadRequestException('Cannot delete supplier: There are purchase orders associated with this supplier. Please delete or reassign the purchase orders first.');
      }
      throw error;
    }
  }
}


