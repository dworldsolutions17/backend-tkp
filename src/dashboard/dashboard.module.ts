import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';
import { Order } from '../orders/order.entity';
import { Discount } from '../discounts/discount.entity';
import { Inventory } from '../inventory/inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Customer,
      Order,
      Discount,
      Inventory,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
