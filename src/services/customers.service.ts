import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { Customer } from '../models/customer.entity';
import {
  PaginationData,
  PaginationUtil,
} from '../utils/pagination.util';

export interface CustomerPage extends PaginationData {
  customers: Customer[];
}

@Injectable()
export class CustomersService {

  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
  ) {}

  findAll(): Promise<Customer[]> {
    return this.customersRepository.find({ order: { id: 'DESC' } });
  }

  async findPage(page: number, pageSize: number): Promise<CustomerPage> {
    const total = await this.customersRepository.count();
    const pagination = PaginationUtil.create(page, pageSize, total);
    const customers = await this.customersRepository.find({
      order: { id: 'DESC' },
      skip: pagination.skip,
      take: pageSize,
    });

    return PaginationUtil.withData(pagination, { customers });
  }

  count(): Promise<number> {
    return this.customersRepository.count();
  }

  async isEmailAvailable(email: string): Promise<boolean> {
    return !(await this.customersRepository.findOneBy({ email }));
  }

  async isNameAvailable(name: string): Promise<boolean> {
    return !(await this.customersRepository.findOneBy({ name }));
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customersRepository.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Customer ${id} was not found`);
    }
    return customer;
  }

  async create(data: CreateCustomerDto): Promise<Customer> {
    await this.ensureNameAvailable(data.name);
    await this.ensureEmailAvailable(data.email);
    return this.saveCustomer(this.customersRepository.create(data));
  }

  async update(id: number, data: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    if (data.name !== customer.name) {
      await this.ensureNameAvailable(data.name, id);
    }
    await this.ensureEmailAvailable(data.email, id);
    Object.assign(customer, data);
    return this.saveCustomer(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customersRepository.remove(customer);
  }

  private async ensureNameAvailable(
    name: string,
    excludeCustomerId?: number,
  ): Promise<void> {
    const existing = await this.customersRepository.findOneBy({ name });
    if (existing && existing.id !== excludeCustomerId) {
      throw new ConflictException('A customer with this name already exists.');
    }
  }

  private async ensureEmailAvailable(
    email: string,
    excludeCustomerId?: number,
  ): Promise<void> {
    const existing = await this.customersRepository.findOneBy({ email });
    if (existing && existing.id !== excludeCustomerId) {
      throw new ConflictException('A customer with this email already exists.');
    }
  }

  private async saveCustomer(customer: Customer): Promise<Customer> {
    try {
      return await this.customersRepository.save(customer);
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new ConflictException(
          'A customer with this name or email already exists.',
        );
      }
      throw error;
    }
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError: unknown = error.driverError;
    return (
      typeof driverError === 'object' &&
      driverError !== null &&
      'code' in driverError &&
      driverError.code === '23505'
    );
  }
  
}
