import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

  const mockInventory = {
    id: 1,
    productId: 1,
    product: { id: 1, name: 'Test Toy' },
    available: 20,
    reserved: 2,
    location: 'Warehouse A',
    lowStockThreshold: 5,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-15'),
  };

  const mockService = {
    findAll: jest.fn().mockResolvedValue({ data: [mockInventory], meta: { total: 1, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false } }),
    findOne: jest.fn().mockResolvedValue(mockInventory),
    findByProductId: jest.fn().mockResolvedValue(mockInventory),
    getLowStockProducts: jest.fn().mockResolvedValue([]),
    getOutOfStockProducts: jest.fn().mockResolvedValue([]),
    adjustInventory: jest.fn().mockResolvedValue({ ...mockInventory, available: 25 }),
    getMovements: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [{ provide: InventoryService, useValue: mockService }],
    }).compile();

    controller = module.get(InventoryController);
    service = module.get(InventoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated inventory items', async () => {
      const result = await controller.findAll({ page: 1, limit: 10 });
      expect(result).toHaveProperty('data');
      expect(result.data[0].available).toBe(20);
    });
  });

  describe('findOne', () => {
    it('should return inventory by id', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockInventory);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('getLowStock', () => {
    it('should return low stock items', async () => {
      const result = await controller.getLowStock();
      expect(result).toEqual([]);
      expect(service.getLowStockProducts).toHaveBeenCalledWith(5);
    });
  });

  describe('getOutOfStock', () => {
    it('should return out of stock items', async () => {
      const result = await controller.getOutOfStock();
      expect(result).toEqual([]);
      expect(service.getOutOfStockProducts).toHaveBeenCalled();
    });
  });

  describe('adjustInventory', () => {
    it('should adjust inventory quantity', async () => {
      const dto = { productId: 1, quantity: 5, type: 'add', reason: 'Restock' };
      const result: any = await controller.adjustInventory(dto as any);
      expect(result.available).toBe(25);
      expect(service.adjustInventory).toHaveBeenCalledWith(dto, 'Admin');
    });
  });

  describe('getMovements', () => {
    it('should return inventory movements', async () => {
      const result = await controller.getMovements({ page: 1, limit: 10 } as any, 1);
      expect(result).toEqual([]);
      expect(service.getMovements).toHaveBeenCalledWith({ page: 1, limit: 10 }, 1);
    });
  });
});
