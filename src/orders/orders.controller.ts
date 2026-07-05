import { Controller, Get, Post, Put, Delete, Body, Param, UploadedFile, UseInterceptors, Res, BadRequestException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders with pagination' })
  findAll(@Query() queryOrdersDto: QueryOrdersDto) {
    return this.ordersService.findAll(queryOrdersDto);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export all orders to CSV' })
  async exportCSV(@Res() res: Response) {
    const csv = await this.ordersService.exportToCSV();
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=orders.csv');
    return res.send(csv);
  }

  @Post('import/csv')
  @ApiOperation({ summary: 'Import orders from CSV file' })
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
    return this.ordersService.importFromCSV(file.buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new order' })
  @ApiBody({ type: CreateOrderDto })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update order' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
