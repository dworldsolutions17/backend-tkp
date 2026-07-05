import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './inventory.entity';
import { InventoryMovement } from './inventory-movement.entity';
import { Product } from '../products/product.entity';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { CsvHelper } from '../common/csv.helper';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse, PaginationHelper } from '../common/pagination.helper';
import { ResourceNotFoundException, BadRequestException, InternalServerErrorException } from '../common/exceptions/custom.exceptions';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryMovement)
    private movementRepository: Repository<InventoryMovement>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<Inventory>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = PaginationHelper.getSkip(page, limit);

    const [data, total] = await this.inventoryRepository.findAndCount({
      relations: ['product'],
      skip,
      take: limit,
      order: { updatedAt: 'DESC' },
    });

    return PaginationHelper.paginate(data, total, page, limit);
  }

  async findOne(id: number): Promise<Inventory> {
    try {
      const inventory = await this.inventoryRepository.findOne({
        where: { id },
        relations: ['product'],
      });

      if (!inventory) {
        throw new ResourceNotFoundException('Inventory', id);
      }

      return inventory;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) throw error;
      this.logger.error(`Failed to find inventory ${id}`, error);
      throw new InternalServerErrorException(`Failed to retrieve inventory: ${error.message}`);
    }
  }

  async findByProductId(productId: number): Promise<Inventory> {
    try {
      const inventory = await this.inventoryRepository.findOne({
        where: { productId },
        relations: ['product'],
      });
      if (!inventory) {
        throw new ResourceNotFoundException('Inventory', `productId ${productId}`);
      }
      return inventory;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) throw error;
      this.logger.error(`Failed to find inventory for product ${productId}`, error);
      throw new InternalServerErrorException(`Failed to retrieve inventory: ${error.message}`);
    }
  }

  async getMovements(paginationDto: PaginationDto, productId?: number): Promise<PaginatedResponse<InventoryMovement>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = PaginationHelper.getSkip(page, limit);

    const query = this.movementRepository.createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .orderBy('movement.createdAt', 'DESC');

    if (productId) {
      query.andWhere('movement.productId = :productId', { productId });
    }

    const [data, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return PaginationHelper.paginate(data, total, page, limit);
  }

  async adjustInventory(adjustDto: AdjustInventoryDto, performedBy?: string): Promise<InventoryMovement> {
    try {
      if (!adjustDto.productId || adjustDto.productId < 0) {
        throw new BadRequestException('Valid product ID is required');
      }
      if (!adjustDto.type || !['in', 'out', 'adjustment', 'return', 'damaged'].includes(adjustDto.type)) {
        throw new BadRequestException('Valid inventory movement type is required');
      }
      if (adjustDto.quantity < 0) {
        throw new BadRequestException('Quantity must be a positive number');
      }

      const product = await this.productRepository.findOne({
        where: { id: adjustDto.productId },
      });

      if (!product) {
        throw new ResourceNotFoundException('Product', adjustDto.productId);
      }

    // Get or create inventory record
    let inventory = await this.inventoryRepository.findOne({
      where: { productId: adjustDto.productId },
    });

    if (!inventory) {
      inventory = this.inventoryRepository.create({
        productId: adjustDto.productId,
        quantity: 0,
        available: 0,
      });
    }

    // Calculate new quantity based on type
    let quantityChange = 0;
    switch (adjustDto.type) {
      case 'in':
      case 'return':
        quantityChange = adjustDto.quantity;
        break;
      case 'out':
      case 'damaged':
        quantityChange = -adjustDto.quantity;
        break;
      case 'adjustment':
        // For adjustment, quantity is the final amount, not change
        quantityChange = adjustDto.quantity - inventory.quantity;
        break;
    }

    // Update inventory
    inventory.quantity += quantityChange;
    inventory.available = inventory.quantity - inventory.committed - inventory.unavailable;
    await this.inventoryRepository.save(inventory);

    // Update product stock
    await this.productRepository.update(adjustDto.productId, {
      stock: inventory.quantity,
    });

      // Record movement
      const movement = this.movementRepository.create({
        productId: adjustDto.productId,
        type: adjustDto.type,
        quantity: Math.abs(quantityChange),
        reason: adjustDto.reason,
        reference: adjustDto.reference,
        notes: adjustDto.notes,
        performedBy: performedBy || 'System',
      });

      return this.movementRepository.save(movement);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ResourceNotFoundException) throw error;
      this.logger.error(`Failed to adjust inventory for product ${adjustDto.productId}`, error);
      throw new InternalServerErrorException(`Failed to adjust inventory: ${error.message}`);
    }
  }

  async updateInventory(id: number, updateDto: UpdateInventoryDto): Promise<Inventory> {
    const inventory = await this.findOne(id);

    if (updateDto.quantity !== undefined) {
      inventory.quantity = updateDto.quantity;
      inventory.available = inventory.quantity - inventory.committed - inventory.unavailable;
      
      // Update product stock
      await this.productRepository.update(inventory.productId, {
        stock: inventory.quantity,
      });
    }

    if (updateDto.location !== undefined) {
      inventory.location = updateDto.location;
    }

    if (updateDto.sku !== undefined) {
      inventory.sku = updateDto.sku;
    }

    return this.inventoryRepository.save(inventory);
  }

  async exportToCSV(): Promise<string> {
    const inventory = await this.inventoryRepository.find({
      relations: ['product'],
    });

    const exportData = inventory.map((item) => ({
      productName: item.product.name,
      sku: item.sku || '',
      location: item.location || '',
      quantity: item.quantity,
      available: item.available,
      committed: item.committed,
      unavailable: item.unavailable,
      incoming: item.incoming,
    }));

    return CsvHelper.generateCSV(exportData);
  }

  async importFromCSV(buffer: Buffer): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      const rows = await CsvHelper.parseCSV<any>(buffer);
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const row of rows) {
        try {
          // Map Shopify inventory CSV columns
          const handle = row.Handle || row.handle;
          const title = row.Title || row.productName;
          const onHand = parseInt(row['On hand (new)'] || row['On hand (current)'] || row.quantity || '0');
          const location = row.Location || row.location || null;
          const sku = row.SKU || row.sku || null;
          const incoming = parseInt(row['Incoming (not editable)'] || row.incoming || '0');
          const unavailable = parseInt(row['Unavailable (not editable)'] || row.unavailable || '0');
          const committed = parseInt(row['Committed (not editable)'] || row.committed || '0');
          const available = parseInt(row['Available (not editable)'] || row.available || '0');

          // Find product by name or SKU
          let product = null;
          if (title) {
            product = await this.productRepository.findOne({
              where: { name: title },
            });
          }

          if (!product) {
            failed++;
            errors.push(`Row ${success + failed}: Product "${title || handle}" not found`);
            continue;
          }

          // Get or create inventory record
          let inventory = await this.inventoryRepository.findOne({
            where: { productId: product.id },
          });

          if (inventory) {
            // Update existing inventory
            inventory.quantity = onHand;
            inventory.location = location || inventory.location;
            inventory.sku = sku || inventory.sku;
            inventory.incoming = incoming;
            inventory.unavailable = unavailable;
            inventory.committed = committed;
            inventory.available = available || (onHand - committed - unavailable);
          } else {
            // Create new inventory record
            inventory = this.inventoryRepository.create({
              productId: product.id,
              quantity: onHand,
              location: location,
              sku: sku,
              incoming: incoming,
              unavailable: unavailable,
              committed: committed,
              available: available || (onHand - committed - unavailable),
            });
          }

          await this.inventoryRepository.save(inventory);

          // Update product stock
          await this.productRepository.update(product.id, {
            stock: onHand,
          });

          success++;
        } catch (error) {
          failed++;
          errors.push(`Row ${success + failed}: ${error.message}`);
        }
      }

      return { success, failed, errors };
    } catch (error) {
      throw new BadRequestException(`Failed to parse CSV: ${error.message}`);
    }
  }

  async getLowStockProducts(threshold: number = 5): Promise<Inventory[]> {
    return this.inventoryRepository.createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .where('inventory.available <= :threshold', { threshold })
      .andWhere('inventory.available > 0')
      .getMany();
  }

  async getOutOfStockProducts(): Promise<Inventory[]> {
    return this.inventoryRepository.createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .where('inventory.available = 0')
      .getMany();
  }
}
