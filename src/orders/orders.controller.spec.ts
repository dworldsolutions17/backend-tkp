import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrder = {
    id: 1,
    orderNumber: 'ORD-123-ABC',
    customerId: 1,
    customerName: 'John Doe',
    customerEmail: 'john@test.com',
    customerPhone: '03001234567',
    shippingAddress: '123 Street, City',
    subtotal: 999,
    discount: 0,
    shippingCost: 150,
    total: 1149,
    status: 'pending',
    items: [],
    orderDate: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockService = {
    findAll: jest.fn().mockResolvedValue({ data: [mockOrder], meta: { total: 1, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false } }),
    findOne: jest.fn().mockResolvedValue(mockOrder),
    create: jest.fn().mockResolvedValue(mockOrder),
    update: jest.fn().mockResolvedValue({ ...mockOrder, status: 'confirmed' }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockService }],
    }).compile();

    controller = module.get(OrdersController);
    service = module.get(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const result = await controller.findAll({ page: 1, limit: 10 } as any);
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('pending');
    });

    it('should filter by status', async () => {
      await controller.findAll({ page: 1, limit: 10, status: 'pending' } as any);
      expect(service.findAll).toHaveBeenCalledWith(
        { page: 1, limit: 10, status: 'pending' },
      );
    });
  });

  describe('findOne', () => {
    it('should return order by id', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockOrder);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create an order with payment method', async () => {
      const dto = {
        customerId: 1,
        items: [{ productId: 1, quantity: 1, price: 999 }],
        shippingAddress: '123 Street',
        totalAmount: 1149,
        paymentMethod: 'cash',
      };
      await controller.create(dto as any);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update order status', async () => {
      const dto = { status: 'confirmed' };
      const result = await controller.update('1', dto as any);
      expect(result.status).toBe('confirmed');
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });

    it('should update with tracking info when shipping', async () => {
      const dto = { status: 'shipped', trackingNumber: 'TRK123' };
      await controller.update('1', dto as any);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should delete an order', async () => {
      await expect(controller.remove('1')).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
