import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { 
  DashboardStats, 
  RevenueByPeriod, 
  TopProduct, 
  OrdersByStatus,
  RecentActivity 
} from './interfaces/dashboard.interface';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiQuery({ name: 'period', enum: ['all', 'today', 'days', 'month', 'year'], required: false })
  @ApiQuery({ name: 'value', type: Number, required: false })
  async getStats(
    @Query('period') period?: string,
    @Query('value') value?: string,
  ): Promise<DashboardStats> {
    return this.dashboardService.getStats(period, value ? parseInt(value) : undefined);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue by period' })
  @ApiQuery({ name: 'period', enum: ['daily', 'monthly'], required: false })
  @ApiQuery({ name: 'days', type: Number, required: false, description: 'Number of days to look back (default: 30)' })
  async getRevenue(
    @Query('period') period: 'daily' | 'monthly' = 'daily',
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ): Promise<RevenueByPeriod[]> {
    return this.dashboardService.getRevenueByPeriod(period, days);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of products to return (default: 10)' })
  async getTopProducts(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<TopProduct[]> {
    return this.dashboardService.getTopProducts(limit);
  }

  @Get('orders-by-status')
  @ApiOperation({ summary: 'Get orders distribution by status' })
  async getOrdersByStatus(): Promise<OrdersByStatus[]> {
    return this.dashboardService.getOrdersByStatus();
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent activity feed' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of activities to return (default: 10)' })
  async getRecentActivity(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<RecentActivity[]> {
    return this.dashboardService.getRecentActivity(limit);
  }

  @Get('sales-comparison')
  @ApiOperation({ summary: 'Compare this month vs last month sales' })
  async getSalesComparison(): Promise<{
    thisMonth: number;
    lastMonth: number;
    percentageChange: number;
  }> {
    return this.dashboardService.getSalesComparison();
  }
}
