import { Controller, Get, Post, Put, Delete, Body, Param, UploadedFile, UseInterceptors, Res, BadRequestException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DiscountsService } from './discounts.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('discounts')
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all discounts with pagination' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.discountsService.findAll(paginationDto);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export all discounts to CSV' })
  async exportCSV(@Res() res: Response) {
    const csv = await this.discountsService.exportToCSV();
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=discounts.csv');
    return res.send(csv);
  }

  @Post('import/csv')
  @ApiOperation({ summary: 'Import discounts from CSV file' })
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
    return this.discountsService.importFromCSV(file.buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get discount by ID' })
  findOne(@Param('id') id: string) {
    return this.discountsService.findOne(+id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get discount by code' })
  findByCode(@Param('code') code: string) {
    return this.discountsService.findByCode(code);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate a discount coupon code' })
  async validate(@Body('code') code: string) {
    return this.discountsService.validateCode(code);
  }

  @Post()
  @ApiOperation({ summary: 'Create new discount' })
  create(@Body() createDiscountDto: any) {
    return this.discountsService.create(createDiscountDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update discount' })
  update(@Param('id') id: string, @Body() updateDiscountDto: any) {
    return this.discountsService.update(+id, updateDiscountDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete discount' })
  remove(@Param('id') id: string) {
    return this.discountsService.remove(+id);
  }
}
