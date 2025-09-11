import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(@InjectRepository(Supplier) private readonly repo: Repository<Supplier>) {}

  async list(): Promise<Supplier[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async create(data: Partial<Supplier>): Promise<Supplier> {
    if (!data.name) throw new ConflictException('Name is required');
    const exists = await this.repo.findOne({ where: { name: ILike(data.name) } });
    if (exists) throw new ConflictException('Supplier already exists');
    const entity = this.repo.create({ ...data, isActive: data.isActive ?? true });
    return this.repo.save(entity);
  }
}


