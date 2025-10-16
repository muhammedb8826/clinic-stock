import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Cost } from './entities/cost.entity';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateCostDto } from './dto/update-cost.dto';
import { CostQueryDto } from './dto/cost-query.dto';

@Injectable()
export class CostsService {
  constructor(
    @InjectRepository(Cost)
    private readonly costRepo: Repository<Cost>,
  ) {}

  async create(createCostDto: CreateCostDto): Promise<Cost> {
    const cost = this.costRepo.create({
      ...createCostDto,
      costDate: new Date(createCostDto.costDate),
    });
    return await this.costRepo.save(cost);
  }

  async findAll(query: CostQueryDto): Promise<{ costs: Cost[]; total: number; page: number; limit: number; totalAmount: number }> {
    const { search, category, startDate, endDate, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.costRepo.createQueryBuilder('cost')
      .where('cost.isActive = :isActive', { isActive: true });

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(cost.description) LIKE LOWER(:search) OR LOWER(cost.category) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    if (category) {
      queryBuilder.andWhere('cost.category = :category', { category });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('cost.costDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    } else if (startDate) {
      queryBuilder.andWhere('cost.costDate >= :startDate', {
        startDate: new Date(startDate),
      });
    } else if (endDate) {
      queryBuilder.andWhere('cost.costDate <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    // Get total count and total amount
    const total = await queryBuilder.getCount();
    
    // Create a separate query for total amount to avoid conflicts
    const totalAmountQuery = this.costRepo.createQueryBuilder('cost')
      .where('cost.isActive = :isActive', { isActive: true });

    // Apply same filters for total amount
    if (search) {
      totalAmountQuery.andWhere(
        '(LOWER(cost.description) LIKE LOWER(:search) OR LOWER(cost.category) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    if (category) {
      totalAmountQuery.andWhere('cost.category = :category', { category });
    }

    if (startDate && endDate) {
      totalAmountQuery.andWhere('cost.costDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    } else if (startDate) {
      totalAmountQuery.andWhere('cost.costDate >= :startDate', {
        startDate: new Date(startDate),
      });
    } else if (endDate) {
      totalAmountQuery.andWhere('cost.costDate <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    const totalAmountResult = await totalAmountQuery
      .select('SUM(cost.amount)', 'totalAmount')
      .getRawOne();
    const totalAmount = parseFloat(totalAmountResult?.totalAmount || '0');

    // Get paginated results
    const costs = await queryBuilder
      .orderBy('cost.costDate', 'DESC')
      .addOrderBy('cost.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      costs,
      total,
      page,
      limit,
      totalAmount,
    };
  }

  async findOne(id: number): Promise<Cost> {
    const cost = await this.costRepo.findOne({
      where: { id, isActive: true },
    });

    if (!cost) {
      throw new NotFoundException(`Cost with ID ${id} not found`);
    }

    return cost;
  }

  async update(id: number, updateCostDto: UpdateCostDto): Promise<Cost> {
    const cost = await this.findOne(id);

    Object.assign(cost, {
      ...updateCostDto,
      ...(updateCostDto.costDate && { costDate: new Date(updateCostDto.costDate) }),
    });

    return await this.costRepo.save(cost);
  }

  async remove(id: number): Promise<void> {
    const cost = await this.findOne(id);
    cost.isActive = false;
    await this.costRepo.save(cost);
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.costRepo
      .createQueryBuilder('cost')
      .select('DISTINCT cost.category', 'category')
      .where('cost.isActive = :isActive', { isActive: true })
      .orderBy('cost.category', 'ASC')
      .getRawMany();

    return categories.map(c => c.category);
  }

  async getCostsByDateRange(startDate: string, endDate: string): Promise<{ costs: Cost[]; totalAmount: number }> {
    const costs = await this.costRepo.find({
      where: {
        costDate: Between(new Date(startDate), new Date(endDate)),
        isActive: true,
      },
      order: {
        costDate: 'DESC',
        createdAt: 'DESC',
      },
    });

    const totalAmount = costs.reduce((sum, cost) => sum + parseFloat(cost.amount.toString()), 0);

    return { costs, totalAmount };
  }
}
