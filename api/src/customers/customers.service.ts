import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    try {
      const customer = this.customerRepo.create(createCustomerDto);
      return await this.customerRepo.save(customer);
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new BadRequestException('Customer with this name already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<Customer[]> {
    return this.customerRepo.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    
    try {
      Object.assign(customer, updateCustomerDto);
      return await this.customerRepo.save(customer);
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new BadRequestException('Customer with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const customer = await this.findOne(id);
      await this.customerRepo.remove(customer);
    } catch (error) {
      if (error.code === '23503') { // Foreign key constraint violation
        throw new BadRequestException('Cannot delete customer: There are sales associated with this customer. Please delete or reassign the sales first.');
      }
      throw error;
    }
  }
}
