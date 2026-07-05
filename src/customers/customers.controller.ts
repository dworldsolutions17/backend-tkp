import { Controller, Get, Post, Put, Delete, Body, Param, UploadedFile, UseInterceptors, Res, HttpStatus, BadRequestException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CustomersService } from './customers.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all customers with pagination' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.customersService.findAll(paginationDto);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export all customers to CSV' })
  async exportCSV(@Res() res: Response) {
    const csv = await this.customersService.exportToCSV();
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=customers.csv');
    return res.send(csv);
  }

  @Post('import/csv')
  @ApiOperation({ summary: 'Import customers from CSV file' })
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
    return this.customersService.importFromCSV(file.buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new customer' })
  create(@Body() createCustomerDto: any) {
    return this.customersService.create(createCustomerDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer' })
  update(@Param('id') id: string, @Body() updateCustomerDto: any) {
    return this.customersService.update(+id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(+id);
  }
}
