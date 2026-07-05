import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../categories/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CsvHelper } from '../common/csv.helper';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse, PaginationHelper } from '../common/pagination.helper';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { ResourceNotFoundException, BadRequestException, InternalServerErrorException } from '../common/exceptions/custom.exceptions';
import { ResponseHelper } from '../common/helpers/response.helper';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findAll(paginationDto: PaginationDto, filters?: GetProductsQueryDto): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = PaginationHelper.getSkip(page, limit);

    const query = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    const hasCategoryId = filters?.categoryId !== undefined && filters?.categoryId !== null;
    if (hasCategoryId) {
      query.andWhere('product.categoryId = :categoryId', { categoryId: Number(filters.categoryId) });
    } else if (filters?.category) {
      const categoryValue = String(filters.category).trim();
      const numericCategoryId = parseInt(categoryValue, 10);

      if (!isNaN(numericCategoryId) && `${numericCategoryId}` === categoryValue) {
        query.andWhere('product.categoryId = :categoryId', { categoryId: numericCategoryId });
      } else {
        const normalizedCategory = categoryValue.toLowerCase();
        query.andWhere(
          '(LOWER(category.name) LIKE :categoryName OR LOWER(category.slug) = :categorySlug)',
          {
            categoryName: `%${normalizedCategory}%`,
            categorySlug: normalizedCategory.replace(/\s+/g, '-'),
          },
        );
      }
    }

    if (filters?.search) {
      query.andWhere('LOWER(product.name) LIKE LOWER(:search)', { search: `%${filters.search}%` });
    }

    if (filters?.status) {
      query.andWhere('product.status = :status', { status: filters.status });
    }

    if (filters?.inStock === true) {
      query.andWhere('product.stock > 0');
    } else if (filters?.inStock === false) {
      query.andWhere('product.stock <= 0');
    }

    const [data, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return PaginationHelper.paginate(data, total, page, limit);
  }

  async findOne(id: number): Promise<Product> {
    try {
      const product = await this.productsRepository.findOne({
        where: { id },
        relations: ['category'],
      });
      if (!product) {
        throw new ResourceNotFoundException('Product', id);
      }
      return product;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) throw error;
      this.logger.error(`Failed to find product ${id}`, error);
      throw new InternalServerErrorException(`Failed to retrieve product: ${error.message}`);
    }
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      if (!createProductDto.name) {
        throw new BadRequestException('Product name is required');
      }
      if (!createProductDto.price || createProductDto.price < 0) {
        throw new BadRequestException('Product price must be a positive number');
      }
      const product = this.productsRepository.create(createProductDto);
      const savedProduct = await this.productsRepository.save(product);
      this.logger.log(`Product created successfully: ${savedProduct.id}`);
      return savedProduct;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Failed to create product', error);
      throw new InternalServerErrorException(`Failed to create product: ${error.message}`);
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    try {
      const existing = await this.findOne(id);
      if (!existing) {
        throw new ResourceNotFoundException('Product', id);
      }
      await this.productsRepository.update(id, updateProductDto);
      this.logger.log(`Product updated successfully: ${id}`);
      return this.findOne(id);
    } catch (error) {
      if (error instanceof ResourceNotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error(`Failed to update product ${id}`, error);
      throw new InternalServerErrorException(`Failed to update product: ${error.message}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const existing = await this.findOne(id);
      if (!existing) {
        throw new ResourceNotFoundException('Product', id);
      }
      await this.productsRepository.delete(id);
      this.logger.log(`Product deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) throw error;
      this.logger.error(`Failed to delete product ${id}`, error);
      throw new InternalServerErrorException(`Failed to delete product: ${error.message}`);
    }
  }

  async exportToCSV(): Promise<string> {
    const products = await this.productsRepository.find({
      relations: ['category'],
    });

    const exportData = products.map((product) => ({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || '',
      category: product.category?.name || '',
      stock: product.stock,
      images: product.images ? product.images.join('; ') : '',
      badge: product.badge || '',
      status: product.status,
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

      // Group rows by Handle (Shopify exports multiple rows per product for images)
      const productGroups = new Map<string, any[]>();
      
      for (const row of rows) {
        const handle = row.Handle || row.handle;
        if (!handle) continue;
        
        if (!productGroups.has(handle)) {
          productGroups.set(handle, []);
        }
        productGroups.get(handle).push(row);
      }

      for (const [handle, productRows] of productGroups) {
        try {
          const firstRow = productRows[0]; // Main product data is in first row
          
          // Map Shopify CSV columns
          const title = firstRow.Title || firstRow.name;
          if (!title) {
            failed++;
            errors.push(`Product ${handle}: Missing title`);
            continue;
          }

          // Clean HTML from description
          const bodyHtml = firstRow['Body (HTML)'] || firstRow.description || '';
          const description = bodyHtml
            .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
            .replace(/\s+/g, ' ')      // Normalize whitespace
            .trim()
            .substring(0, 1000);       // Limit length

          // Parse prices
          const price = parseFloat(firstRow['Variant Price'] || firstRow.price || '0');
          const originalPrice = parseFloat(firstRow['Variant Compare At Price'] || firstRow.originalPrice || '0') || null;
          
          // Parse stock
          const stock = parseInt(firstRow['Variant Inventory Qty'] || firstRow.stock || '0');

          // Map status
          const published = (firstRow.Published || '').toString().toLowerCase() === 'true';
          const statusField = (firstRow.Status || '').toLowerCase();
          let status = 'active';
          if (statusField === 'draft' || !published) {
            status = 'draft';
          } else if (statusField === 'archived') {
            status = 'inactive';
          }

          // Collect all image URLs from all rows for this product
          const images: string[] = [];
          for (const row of productRows) {
            const imageUrl = row['Image Src'] || row.image;
            if (imageUrl && imageUrl.trim() && !images.includes(imageUrl.trim())) {
              images.push(imageUrl.trim());
            }
          }

          // Find or create category
          let category = null;
          const categoryName = firstRow['Product Category'] || firstRow.Type || firstRow.category;
          if (categoryName) {
            const cleanCategoryName = categoryName.split('>').pop().trim(); // Take last part if hierarchical
            category = await this.categoriesRepository.findOne({
              where: { name: cleanCategoryName },
            });

            if (!category) {
              // Create slug from category name
              const slug = cleanCategoryName.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
              
              category = await this.categoriesRepository.save({
                name: cleanCategoryName,
                slug: slug,
                description: null,
              });
            }
          }

          // Check if product already exists by name
          const existing = await this.productsRepository.findOne({
            where: { name: title },
          });

          if (existing) {
            // Update existing product
            await this.productsRepository.update(existing.id, {
              description: description,
              price: price,
              originalPrice: originalPrice,
              categoryId: category?.id || existing.categoryId,
              stock: stock,
              images: images.length > 0 ? images : existing.images,
              status: status,
            });
          } else {
            // Create new product
            await this.productsRepository.save({
              name: title,
              description: description,
              price: price,
              originalPrice: originalPrice,
              categoryId: category?.id || null,
              stock: stock,
              images: images.length > 0 ? images : null,
              badge: null,
              status: status,
            });
          }
          success++;
        } catch (error) {
          failed++;
          errors.push(`Product ${handle}: ${error.message}`);
        }
      }

      return { success, failed, errors };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Failed to import products from CSV', error);
      throw new BadRequestException(`Failed to import CSV: ${error.message}`);
    }
  }
}
