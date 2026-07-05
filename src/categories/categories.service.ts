import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse, PaginationHelper } from '../common/pagination.helper';
import { ResourceNotFoundException, BadRequestException, InternalServerErrorException } from '../common/exceptions/custom.exceptions';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<Category>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = PaginationHelper.getSkip(page, limit);

    const [data, total] = await this.categoriesRepository.findAndCount({
      relations: ['products'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return PaginationHelper.paginate(data, total, page, limit);
  }

  async findOne(id: number): Promise<Category> {
    try {
      const category = await this.categoriesRepository.findOne({
        where: { id },
        relations: ['products'],
      });
      if (!category) {
        throw new ResourceNotFoundException('Category', id);
      }
      return category;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) throw error;
      this.logger.error(`Failed to find category ${id}`, error);
      throw new InternalServerErrorException(`Failed to retrieve category: ${error.message}`);
    }
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      if (!createCategoryDto.name) {
        throw new BadRequestException('Category name is required');
      }
      if (!createCategoryDto.slug) {
        createCategoryDto.slug = createCategoryDto.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      const category = this.categoriesRepository.create(createCategoryDto);
      return await this.categoriesRepository.save(category);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Failed to create category', error);
      throw new InternalServerErrorException(`Failed to create category: ${error.message}`);
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    try {
      const existing = await this.findOne(id);
      if (!existing) {
        throw new ResourceNotFoundException('Category', id);
      }
      if (updateCategoryDto.name && !updateCategoryDto.slug) {
        updateCategoryDto.slug = updateCategoryDto.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      await this.categoriesRepository.update(id, updateCategoryDto);
      return this.findOne(id);
    } catch (error) {
      if (error instanceof ResourceNotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error(`Failed to update category ${id}`, error);
      throw new InternalServerErrorException(`Failed to update category: ${error.message}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const existing = await this.findOne(id);
      if (!existing) {
        throw new ResourceNotFoundException('Category', id);
      }
      await this.categoriesRepository.delete(id);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) throw error;
      this.logger.error(`Failed to delete category ${id}`, error);
      throw new InternalServerErrorException(`Failed to delete category: ${error.message}`);
    }
  }
}
