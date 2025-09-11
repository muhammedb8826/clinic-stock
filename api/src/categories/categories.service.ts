import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, ILike } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const exists = await this.categoryRepository.findOne({ where: { name: ILike(dto.name) } });
    if (exists) throw new ConflictException('Category with this name already exists');
    const category = this.categoryRepository.create(dto);
    return this.categoryRepository.save(category);
  }

  async findAll(query?: { search?: string; page?: number; limit?: number; isActive?: boolean }): Promise<{ categories: Category[]; total: number; page: number; limit: number }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const base: any = {};
    if (query?.isActive !== undefined) base.isActive = query.isActive;

    const options: FindManyOptions<Category> = {
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    };

    if (query?.search) {
      const like = ILike(`%${query.search}%`);
      options.where = [{ ...base, name: like }];
    } else if (Object.keys(base).length > 0) {
      options.where = base;
    }

    const [categories, total] = await this.categoryRepository.findAndCount(options);
    return { categories, total, page, limit };
  }

  async findOne(id: number): Promise<Category> {
    const entity = await this.categoryRepository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Category not found');
    return entity;
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const entity = await this.findOne(id);
    if (dto.name && dto.name !== entity.name) {
      const exists = await this.categoryRepository.findOne({ where: { name: ILike(dto.name) } });
      if (exists) throw new ConflictException('Category with this name already exists');
    }
    Object.assign(entity, dto);
    return this.categoryRepository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.categoryRepository.remove(entity);
  }
}


