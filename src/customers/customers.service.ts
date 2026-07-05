import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CsvHelper } from '../common/csv.helper';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse, PaginationHelper } from '../common/pagination.helper';
import { ResourceNotFoundException, BadRequestException, DuplicateResourceException, InternalServerErrorException } from '../common/exceptions/custom.exceptions';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<Customer>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = PaginationHelper.getSkip(page, limit);

    const [data, total] = await this.customersRepository.findAndCount({
      relations: ['orders'],
      skip,
      take: limit,
      order: { joinedDate: 'DESC' },
    });

    return PaginationHelper.paginate(data, total, page, limit);
  }

  async findOne(id: number): Promise<Customer> {
    try {
      const customer = await this.customersRepository.findOne({
        where: { id },
        relations: ['orders'],
      });
      if (!customer) {
        throw new ResourceNotFoundException('Customer', id);
      }
      return customer;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) throw error;
      this.logger.error(`Failed to find customer ${id}`, error);
      throw new InternalServerErrorException(`Failed to retrieve customer: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<Customer> {
    try {
      return await this.customersRepository.findOne({ where: { email } });
    } catch (error) {
      this.logger.error(`Failed to find customer by email ${email}`, error);
      throw new InternalServerErrorException(`Failed to find customer: ${error.message}`);
    }
  }

  async create(createCustomerDto: any): Promise<Customer> {
    try {
      if (!createCustomerDto.email) {
        throw new BadRequestException('Email is required');
      }
      if (!createCustomerDto.name) {
        throw new BadRequestException('Name is required');
      }
      const existing = await this.findByEmail(createCustomerDto.email);
      if (existing) {
        throw new DuplicateResourceException('Customer', 'email', createCustomerDto.email);
      }
      const customer = this.customersRepository.create(createCustomerDto);
      const saved = await this.customersRepository.save(customer);
      return Array.isArray(saved) ? saved[0] : saved;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof DuplicateResourceException) throw error;
      this.logger.error('Failed to create customer', error);
      throw new InternalServerErrorException(`Failed to create customer: ${error.message}`);
    }
  }

  async update(id: number, updateCustomerDto: any): Promise<Customer> {
    try {
      const existing = await this.findOne(id);
      if (!existing) {
        throw new ResourceNotFoundException('Customer', id);
      }
      await this.customersRepository.update(id, updateCustomerDto);
      return this.findOne(id);
    } catch (error) {
      if (error instanceof ResourceNotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error(`Failed to update customer ${id}`, error);
      throw new InternalServerErrorException(`Failed to update customer: ${error.message}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const existing = await this.findOne(id);
      if (!existing) {
        throw new ResourceNotFoundException('Customer', id);
      }
      await this.customersRepository.delete(id);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) throw error;
      this.logger.error(`Failed to delete customer ${id}`, error);
      throw new InternalServerErrorException(`Failed to delete customer: ${error.message}`);
    }
  }

  async exportToCSV(): Promise<string> {
    const customers = await this.customersRepository.find({
      select: ['id', 'name', 'email', 'phone', 'city', 'address', 'joinedDate'],
    });

    const exportData = customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      city: customer.city || '',
      address: customer.address || '',
      joinedDate: customer.joinedDate,
    }));

    return CsvHelper.generateCSV(exportData);
  }

  async importFromCSV(buffer: Buffer): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      if (!buffer || buffer.length === 0) {
        throw new BadRequestException('CSV file is empty');
      }
      const rows = await CsvHelper.parseCSV<any>(buffer);
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const row of rows) {
        try {
          // Skip rows without email
          const email = row.Email || row.email;
          if (!email) {
            continue;
          }

          // Map Shopify CSV columns to our schema
          const firstName = row['First Name'] || row.firstName || '';
          const lastName = row['Last Name'] || row.lastName || '';
          const name = row.name || (firstName && lastName ? `${firstName} ${lastName}`.trim() : firstName || lastName || 'Customer');
          const phone = row.Phone || row['Default Address Phone'] || row.phone || '';
          const city = row['Default Address City'] || row.city || null;
          const address1 = row['Default Address Address1'] || row.address || '';
          const address2 = row['Default Address Address2'] || '';
          const address = address1 && address2 ? `${address1}, ${address2}` : (address1 || address2 || null);

          // Check if customer with email already exists
          const existing = await this.customersRepository.findOne({
            where: { email: email },
          });

          if (existing) {
            // Update existing customer
            await this.customersRepository.update(existing.id, {
              name: name,
              phone: phone,
              city: city,
              address: address,
            });
          } else {
            // Create new customer with hashed password if provided
            const customerData: any = {
              name: name,
              email: email,
              phone: phone,
              city: city,
              address: address,
            };

            // Hash password if provided, otherwise set a default
            if (row.password) {
              customerData.password = await bcrypt.hash(row.password, 10);
            } else {
              customerData.password = await bcrypt.hash('password123', 10);
            }

            await this.customersRepository.save(customerData);
          }
          success++;
        } catch (error) {
          failed++;
          errors.push(`Row ${success + failed}: ${error.message}`);
        }
      }

      return { success, failed, errors };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Failed to import customers from CSV', error);
      throw new BadRequestException(`Failed to import CSV: ${error.message}`);
    }
  }
}
