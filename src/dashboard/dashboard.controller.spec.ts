import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  const mockStats = {
    totalProducts: 100,
    totalOrders: 50,
    totalCustomers: 30,
    totalRevenue: 150000,
    todayRevenue: 5000,
    activeDiscounts: 5,
    lowStockProducts: 3,
    outOfStockProducts: 2,
    pendingOrders: 10,
    completedOrders: 35,
    cancelledOrders: 5,
  };

  const mockRevenue = [
    { period: '2026-06', revenue: 25000, orders: 8 },
    { period: '2026-07', revenue: 30000, orders: 10 },
  ];

  const mockService = {
    getStats: jest.fn().mockResolvedValue(mockStats),
    getRevenueByPeriod: jest.fn().mockResolvedValue(mockRevenue),
    getTopProducts: jest.fn().mockResolvedValue([]),
    getOrdersByStatus: jest.fn().mockResolvedValue([]),
    getRecentActivity: jest.fn().mockResolvedValue([]),
    getSalesComparison: jest.fn().mockResolvedValue({ thisMonth: 30000, lastMonth: 25000, percentageChange: 20 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: mockService }],
    }).compile();

    controller = module.get(DashboardController);
    service = module.get(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStats', () => {
    it('should return dashboard statistics', async () => {
      const result = await controller.getStats();
      expect(result.totalProducts).toBe(100);
      expect(result.totalRevenue).toBe(150000);
    });

    it('should pass period filter to service', async () => {
      await controller.getStats('month');
      expect(service.getStats).toHaveBeenCalledWith('month', undefined);
    });

    it('should pass days filter to service', async () => {
      await controller.getStats('days', '7');
      expect(service.getStats).toHaveBeenCalledWith('days', 7);
    });

    it('should not pass filter for all-time', async () => {
      await controller.getStats('all');
      expect(service.getStats).toHaveBeenCalledWith('all', undefined);
    });
  });

  describe('getRevenue', () => {
    it('should return revenue data', async () => {
      const result = await controller.getRevenue('monthly', 30);
      expect(result).toHaveLength(2);
      expect(result[0].revenue).toBe(25000);
      expect(service.getRevenueByPeriod).toHaveBeenCalledWith('monthly', 30);
    });
  });

  describe('getSalesComparison', () => {
    it('should return sales comparison data', async () => {
      const result = await controller.getSalesComparison();
      expect(result.thisMonth).toBe(30000);
      expect(result.percentageChange).toBe(20);
    });
  });
});
