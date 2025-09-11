import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindManyOptions } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { Medicine } from './entities/medicine.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { MedicineQueryDto } from './dto/medicine-query.dto';

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createMedicineDto: CreateMedicineDto): Promise<Medicine> {
    // Check if medicine with same name already exists
    const existingMedicine = await this.medicineRepository.findOne({
      where: { name: createMedicineDto.name },
    });

    if (existingMedicine) {
      throw new ConflictException('Medicine with this name already exists');
    }

    const medicine = this.medicineRepository.create({
      ...createMedicineDto,
    });

    if (createMedicineDto.categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: createMedicineDto.categoryId } });
      if (category) {
        medicine.categoryId = category.id;
      }
    }
    return await this.medicineRepository.save(medicine);
  }

  async findAll(queryDto: MedicineQueryDto): Promise<{ medicines: Medicine[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, form, category, manufacturer, prescriptionRequired, isActive } = queryDto;
    
    const options: FindManyOptions<Medicine> = {
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    };

    // Build base AND filters first
    const baseWhere: any = {};
    if (form) baseWhere.form = form;
    if (category) baseWhere.category = category;
    if (manufacturer) baseWhere.manufacturer = manufacturer;
    if (prescriptionRequired !== undefined) baseWhere.prescriptionRequired = prescriptionRequired;
    if (isActive !== undefined) baseWhere.isActive = isActive;

    // If search present, build OR conditions that include the base filters (AND)
    if (search && search.trim().length > 0) {
      const like = ILike(`%${search}%`);
      options.where = [
        { ...baseWhere, name: like },
        { ...baseWhere, genericName: like },
        { ...baseWhere, manufacturer: like },
      ];
    } else if (Object.keys(baseWhere).length > 0) {
      options.where = baseWhere;
    }

    const [medicines, total] = await this.medicineRepository.findAndCount({
      ...options,
      relations: { category: true },
    });

    return {
      medicines,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Medicine> {
    const medicine = await this.medicineRepository.findOne({ where: { id } });
    
    if (!medicine) {
      throw new NotFoundException(`Medicine with ID ${id} not found`);
    }

    return medicine;
  }

  async update(id: number, updateMedicineDto: UpdateMedicineDto): Promise<Medicine> {
    const medicine = await this.findOne(id);

    // Check if updating name and it conflicts with existing medicine
    if ('name' in updateMedicineDto && updateMedicineDto.name && updateMedicineDto.name !== medicine.name) {
      const existingMedicine = await this.medicineRepository.findOne({
        where: { name: updateMedicineDto.name },
      });

      if (existingMedicine) {
        throw new ConflictException('Medicine with this name already exists');
      }
    }

    Object.assign(medicine, updateMedicineDto);
    return await this.medicineRepository.save(medicine);
  }

  async remove(id: number): Promise<void> {
    const medicine = await this.findOne(id);
    await this.medicineRepository.remove(medicine);
  }

  async findByBarcode(barcode: string): Promise<Medicine> {
    const medicine = await this.medicineRepository.findOne({ where: { barcode } });
    
    if (!medicine) {
      throw new NotFoundException(`Medicine with barcode ${barcode} not found`);
    }

    return medicine;
  }

  async getCategories(): Promise<{ id: number; name: string }[]> {
    const result = await this.categoryRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
      select: ['id', 'name'],
    });
    return result.map(c => ({ id: c.id, name: c.name }));
  }

  async getManufacturers(): Promise<string[]> {
    const result = await this.medicineRepository
      .createQueryBuilder('medicine')
      .select('DISTINCT medicine.manufacturer', 'manufacturer')
      .where('medicine.isActive = :isActive', { isActive: true })
      .getRawMany();

    return result.map(item => item.manufacturer);
  }
}
