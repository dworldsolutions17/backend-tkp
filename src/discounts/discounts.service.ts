import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discount } from './discount.entity';
import { CsvHelper } from '../common/csv.helper';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse, PaginationHelper } from '../common/pagination.helper';
import { ResourceNotFoundException, BadRequestException, InternalServerErrorException } from '../common/exceptions/custom.exceptions';

@Injectable()
export class DiscountsService {
  private readonly logger = new Logger(DiscountsService.name);

  constructor(
    @InjectRepository(Discount)
    private discountsRepository: Repository<Discount>,
  ) {}

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<Discount>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = PaginationHelper.getSkip(page, limit);

    const [data, total] = await this.discountsRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return PaginationHelper.paginate(data, total, page, limit);
  }

  async findOne(id: number): Promise<Discount> {
    try {
      const discount = await this.discountsRepository.findOne({ where: { id } });
      if (!discount) {
        throw new ResourceNotFoundException('Discount', id);
      }
      return discount;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) throw error;
      this.logger.error(`Failed to find discount ${id}`, error);
      throw new InternalServerErrorException(`Failed to retrieve discount: ${error.message}`);
    }
  }

  async findByCode(code: string): Promise<Discount> {
    try {
      return await this.discountsRepository.findOne({ where: { code } });
    } catch (error) {
      this.logger.error(`Failed to find discount by code ${code}`, error);
      throw new InternalServerErrorException(`Failed to find discount: ${error.message}`);
    }
  }

  async create(createDiscountDto: any): Promise<Discount> {
    try {
      if (!createDiscountDto.code) {
        throw new BadRequestException('Discount code is required');
      }
      if (!createDiscountDto.value || createDiscountDto.value < 0) {
        throw new BadRequestException('Discount value must be a positive number');
      }
      const discount = this.discountsRepository.create(createDiscountDto);
      const saved = await this.discountsRepository.save(discount);
      return Array.isArray(saved) ? saved[0] : saved;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Failed to create discount', error);
      throw new InternalServerErrorException(`Failed to create discount: ${error.message}`);
    }
  }

  async update(id: number, updateDiscountDto: any): Promise<Discount> {
    try {
      const existing = await this.findOne(id);
      if (!existing) {
        throw new ResourceNotFoundException('Discount', id);
      }
      await this.discountsRepository.update(id, updateDiscountDto);
      return this.findOne(id);
    } catch (error) {
      if (error instanceof ResourceNotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error(`Failed to update discount ${id}`, error);
      throw new InternalServerErrorException(`Failed to update discount: ${error.message}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const existing = await this.findOne(id);
      if (!existing) {
        throw new ResourceNotFoundException('Discount', id);
      }
      await this.discountsRepository.delete(id);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) throw error;
      this.logger.error(`Failed to delete discount ${id}`, error);
      throw new InternalServerErrorException(`Failed to delete discount: ${error.message}`);
    }
  }

  async exportToCSV(): Promise<string> {
    const discounts = await this.discountsRepository.find();

    const exportData = discounts.map((discount) => ({
      code: discount.code,
      type: discount.type,
      value: discount.value,
      minOrder: discount.minOrder,
      maxDiscount: discount.maxDiscount || '',
      usageLimit: discount.usageLimit,
      used: discount.used,
      status: discount.status,
      expiry: discount.expiry || '',
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
          // Map Shopify CSV columns to our schema
          const code = row.Name || row.code;
          if (!code) {
            continue; // Skip rows without discount code
          }

          // Map discount type
          const valueType = (row['Value Type'] || row.type || 'percentage').toLowerCase();
          const type = valueType.includes('percent') ? 'percentage' : 'fixed';
          
          // Parse value (Shopify exports negative values for discounts)
          const value = Math.abs(parseFloat(row.Value || row.value || '0'));
          
          // Parse usage limits
          const usageLimit = parseInt(row['Usage Limit Per Code'] || row.usageLimit) || 100;
          const used = parseInt(row['Times Used In Total'] || row.used) || 0;
          
          // Map status
          const statusRaw = (row.Status || row.status || 'active').toLowerCase();
          const status = statusRaw === 'active' ? 'active' : 'inactive';
          
          // Parse dates
          const expiry = row.End || row.expiry ? new Date(row.End || row.expiry) : null;

          // Check if discount code already exists
          const existing = await this.discountsRepository.findOne({
            where: { code: code },
          });

          if (existing) {
            // Update existing discount
            await this.discountsRepository.update(existing.id, {
              type: type,
              value: value,
              minOrder: parseFloat(row['Minimum Purchase Requirements'] || row.minOrder) || 0,
              maxDiscount: row.maxDiscount ? parseFloat(row.maxDiscount) : null,
              usageLimit: usageLimit,
              used: used,
              status: status,
              expiry: expiry,
            });
          } else {
            // Create new discount
            await this.discountsRepository.save({
              code: code,
              type: type,
              value: value,
              minOrder: parseFloat(row['Minimum Purchase Requirements'] || row.minOrder) || 0,
              maxDiscount: row.maxDiscount ? parseFloat(row.maxDiscount) : null,
              usageLimit: usageLimit,
              used: used,
              status: status,
              expiry: expiry,
            });
          }
          success++;
        } catch (error) {
          failed++;
          errors.push(`Row ${success + failed} (${row.Name || row.code}): ${error.message}`);
        }
      }

      return { success, failed, errors };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Failed to import discounts from CSV', error);
      throw new BadRequestException(`Failed to import CSV: ${error.message}`);
    }
  }
}
