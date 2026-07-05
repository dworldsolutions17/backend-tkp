import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';
import { Order } from '../orders/order.entity';
import { Discount } from '../discounts/discount.entity';
import { Inventory } from '../inventory/inventory.entity';
import { 
  DashboardStats, 
  RevenueByPeriod, 
  TopProduct, 
  OrdersByStatus,
  RecentActivity 
} from './interfaces/dashboard.interface';
import { InternalServerErrorException } from '../common/exceptions/custom.exceptions';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  async getStats(period?: string, value?: number): Promise<DashboardStats> {
    try {
      const { startDate, endDate } = this.getDateFilter(period, value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const hasDateFilter = !!startDate;

      // Build conditional date filters for order queries
      const orderDateFilter = (qb: any) => {
        if (startDate) qb.andWhere('order.orderDate >= :startDate', { startDate });
        if (endDate) qb.andWhere('order.orderDate <= :endDate', { endDate });
      };

      const productDateFilter = (qb: any) => {
        if (startDate) qb.andWhere('product.createdAt >= :startDate', { startDate });
        if (endDate) qb.andWhere('product.createdAt <= :endDate', { endDate });
      };

      const customerDateFilter = (qb: any) => {
        if (startDate) qb.andWhere('customer.joinedDate >= :startDate', { startDate });
        if (endDate) qb.andWhere('customer.joinedDate <= :endDate', { endDate });
      };

      // Run all queries in parallel for better performance
      const [
        totalProducts,
        totalCustomers,
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        activeDiscounts,
        totalRevenueResult,
        todayRevenueResult,
        lowStockProducts,
        outOfStockProducts,
      ] = await Promise.all([
        // Total products
        hasDateFilter
          ? this.productRepository
              .createQueryBuilder('product')
              .where('product.status = :status', { status: 'active' })
              .andWhere('product.createdAt >= :startDate', { startDate })
              .getCount()
          : this.productRepository.count({ where: { status: 'active' } }),
        
        // Total customers
        hasDateFilter
          ? this.customerRepository
              .createQueryBuilder('customer')
              .where('customer.joinedDate >= :startDate', { startDate })
              .getCount()
          : this.customerRepository.count(),
        
        // Total orders
        (() => {
          const qb = this.orderRepository.createQueryBuilder('order');
          orderDateFilter(qb);
          return qb.getCount();
        })(),
        
        // Completed orders
        (() => {
          const qb = this.orderRepository.createQueryBuilder('order')
            .where('order.status = :status', { status: 'completed' });
          orderDateFilter(qb);
          return qb.getCount();
        })(),
        
        // Pending orders
        (() => {
          const qb = this.orderRepository.createQueryBuilder('order')
            .where('order.status = :status', { status: 'pending' });
          orderDateFilter(qb);
          return qb.getCount();
        })(),
        
        // Cancelled orders
        (() => {
          const qb = this.orderRepository.createQueryBuilder('order')
            .where('order.status = :status', { status: 'cancelled' });
          orderDateFilter(qb);
          return qb.getCount();
        })(),
        
        // Active discounts
        this.discountRepository.count({ where: { status: 'active' } }),
        
        // Total revenue (from completed orders)
        (() => {
          const qb = this.orderRepository
            .createQueryBuilder('order')
            .select('COALESCE(SUM(order.total), 0)', 'total')
            .where('order.status = :status', { status: 'completed' });
          orderDateFilter(qb);
          return qb.getRawOne();
        })(),
        
        // Today's revenue
        this.orderRepository
          .createQueryBuilder('order')
          .select('COALESCE(SUM(order.total), 0)', 'total')
          .where('order.status = :status', { status: 'completed' })
          .andWhere('order.orderDate >= :today', { today })
          .andWhere('order.orderDate < :tomorrow', { tomorrow })
          .getRawOne(),
        
        // Low stock products (available between 1 and 10)
        this.inventoryRepository
          .createQueryBuilder('inventory')
          .where('inventory.available >= :min', { min: 1 })
          .andWhere('inventory.available <= :max', { max: 10 })
          .getCount(),
        
        // Out of stock products
        this.inventoryRepository.count({ where: { available: 0 } }),
      ]);

      return {
        totalProducts,
        totalCustomers,
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        activeDiscounts,
        totalRevenue: parseFloat(totalRevenueResult?.total || '0'),
        todayRevenue: parseFloat(todayRevenueResult?.total || '0'),
        lowStockProducts,
        outOfStockProducts,
      };
    } catch (error) {
      this.logger.error('Failed to retrieve dashboard statistics', error);
      throw new InternalServerErrorException(`Failed to retrieve dashboard stats: ${error.message}`);
    }
  }

  private getDateFilter(period?: string, value?: number): { startDate?: Date; endDate?: Date } {
    if (!period || period === 'all') return {};
    
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    
    let startDate: Date;
    let endDate: Date | undefined;
    
    switch (period) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = now;
        break;
      case 'days':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - (value || 30));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return {};
    }
    
    return { startDate, endDate };
  }

  async getRevenueByPeriod(period: 'daily' | 'monthly', days: number = 30): Promise<RevenueByPeriod[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const groupExpression = period === 'daily'
        ? "TO_CHAR(order.orderDate, 'YYYY-MM-DD')"
        : "TO_CHAR(order.orderDate, 'YYYY-MM')";

      const results = await this.orderRepository
        .createQueryBuilder('order')
        .select(groupExpression, 'period')
        .addSelect('COALESCE(SUM(order.total), 0)', 'revenue')
        .addSelect('COUNT(order.id)::int', 'orders')
        .where('order.status = :status', { status: 'completed' })
        .andWhere('order.orderDate >= :startDate', { startDate })
        .groupBy(groupExpression)
        .orderBy(groupExpression, 'ASC')
        .getRawMany();

      return results.map(row => ({
        period: row.period,
        revenue: parseFloat(row.revenue || '0'),
        orders: parseInt(row.orders || '0'),
      }));
    } catch (error) {
      this.logger.error('Failed to retrieve revenue by period', error);
      throw new InternalServerErrorException(`Failed to retrieve revenue data: ${error.message}`);
    }
  }

  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    try {
      const results = await this.orderRepository
        .createQueryBuilder('order')
        .leftJoin('order.items', 'item')
        .leftJoin('item.product', 'product')
        .select('product.id', 'productId')
        .addSelect('product.name', 'productName')
        .addSelect('SUM(item.quantity)', 'totalSold')
        .addSelect('SUM(item.quantity * item.price)', 'revenue')
        .where('order.status = :status', { status: 'completed' })
        .groupBy('product.id')
        .addGroupBy('product.name')
        .orderBy('revenue', 'DESC')
        .limit(limit)
        .getRawMany();

      return results.map(row => ({
        productId: row.productId,
        productName: row.productName,
        totalSold: parseInt(row.totalSold || '0'),
        revenue: parseFloat(row.revenue || '0'),
      }));
    } catch (error) {
      this.logger.error('Failed to retrieve top products', error);
      throw new InternalServerErrorException(`Failed to retrieve top products: ${error.message}`);
    }
  }

  async getOrdersByStatus(): Promise<OrdersByStatus[]> {
    try {
      const totalOrders = await this.orderRepository.count();
      
      const results = await this.orderRepository
        .createQueryBuilder('order')
        .select('order.status', 'status')
        .addSelect('COUNT(order.id)', 'count')
        .groupBy('order.status')
        .getRawMany();

      return results.map(row => ({
        status: row.status,
        count: parseInt(row.count || '0'),
        percentage: totalOrders > 0 ? (parseInt(row.count || '0') / totalOrders) * 100 : 0,
      }));
    } catch (error) {
      this.logger.error('Failed to retrieve orders by status', error);
      throw new InternalServerErrorException(`Failed to retrieve order statistics: ${error.message}`);
    }
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const activities: RecentActivity[] = [];

      // Get recent orders
      const recentOrders = await this.orderRepository.find({
        take: Math.ceil(limit / 2),
        order: { orderDate: 'DESC' },
      });

      recentOrders.forEach(order => {
        activities.push({
          type: 'order',
          title: `Order ${order.orderNumber}`,
          description: `${order.customerName} placed an order for ${order.total} PKR`,
          timestamp: order.orderDate,
        });
      });

      // Get recent customers
      const recentCustomers = await this.customerRepository.find({
        take: Math.ceil(limit / 2),
        order: { joinedDate: 'DESC' },
      });

      recentCustomers.forEach(customer => {
        activities.push({
          type: 'customer',
          title: 'New Customer',
          description: `${customer.name} joined`,
          timestamp: customer.joinedDate,
        });
      });

      // Sort by timestamp and limit
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    } catch (error) {
      this.logger.error('Failed to retrieve recent activity', error);
      throw new InternalServerErrorException(`Failed to retrieve activity: ${error.message}`);
    }
  }

  async getSalesComparison(): Promise<{
    thisMonth: number;
    lastMonth: number;
    percentageChange: number;
  }> {
    try {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      const [thisMonthResult, lastMonthResult] = await Promise.all([
        this.orderRepository
          .createQueryBuilder('order')
          .select('SUM(order.total)', 'total')
          .where('order.status = :status', { status: 'completed' })
          .andWhere('order.orderDate >= :start', { start: thisMonthStart })
          .getRawOne(),
        
        this.orderRepository
          .createQueryBuilder('order')
          .select('SUM(order.total)', 'total')
          .where('order.status = :status', { status: 'completed' })
          .andWhere('order.orderDate >= :start', { start: lastMonthStart })
          .andWhere('order.orderDate <= :end', { end: lastMonthEnd })
          .getRawOne(),
      ]);

      const thisMonth = parseFloat(thisMonthResult?.total || '0');
      const lastMonth = parseFloat(lastMonthResult?.total || '0');
      const percentageChange = lastMonth > 0 
        ? ((thisMonth - lastMonth) / lastMonth) * 100 
        : 0;

      return {
        thisMonth,
        lastMonth,
        percentageChange,
      };
    } catch (error) {
      this.logger.error('Failed to retrieve sales comparison', error);
      throw new InternalServerErrorException(`Failed to retrieve sales comparison: ${error.message}`);
    }
  }
}
