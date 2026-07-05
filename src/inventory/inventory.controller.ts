import { Controller, Get, Post, Put, Body, Param, Query, UploadedFile, UseInterceptors, Res, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { InventoryService } from './inventory.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all inventory records with pagination' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.inventoryService.findAll(paginationDto);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export inventory to CSV' })
  async exportCSV(@Res() res: Response) {
    const csv = await this.inventoryService.exportToCSV();
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=inventory.csv');
    return res.send(csv);
  }

  @Post('import/csv')
  @ApiOperation({ summary: 'Import inventory from CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importCSV(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.inventoryService.importFromCSV(file.buffer);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock products' })
  @ApiQuery({ name: 'threshold', required: false, type: Number })
  getLowStock(@Query('threshold') threshold?: number) {
    return this.inventoryService.getLowStockProducts(threshold ? +threshold : 5);
  }

  @Get('out-of-stock')
  @ApiOperation({ summary: 'Get out of stock products' })
  getOutOfStock() {
    return this.inventoryService.getOutOfStockProducts();
  }

  @Get('movements')
  @ApiOperation({ summary: 'Get inventory movements with pagination' })
  @ApiQuery({ name: 'productId', required: false, type: Number })
  getMovements(@Query() paginationDto: PaginationDto, @Query('productId') productId?: number) {
    return this.inventoryService.getMovements(paginationDto, productId ? +productId : undefined);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get inventory by product ID' })
  findByProduct(@Param('productId') productId: string) {
    return this.inventoryService.findByProductId(+productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory by ID' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(+id);
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Adjust inventory (add/remove stock)' })
  adjustInventory(@Body() adjustDto: AdjustInventoryDto) {
    return this.inventoryService.adjustInventory(adjustDto, 'Admin');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update inventory record' })
  update(@Param('id') id: string, @Body() updateDto: UpdateInventoryDto) {
    return this.inventoryService.updateInventory(+id, updateDto);
  }
}
