import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Customer } from '../customers/customer.entity';
import { Discount } from '../discounts/discount.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Customer, Discount])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
