import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

describe('CustomersController', () => {
  let controller: CustomersController;
  let service: CustomersService;

  const mockCustomer = {
    id: 1,
    name: 'John Doe',
    email: 'john@test.com',
    phone: '03001234567',
    address: '123 Street, City',
    totalOrders: 5,
    totalSpent: 25000,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-15'),
  };

  const mockService = {
    findAll: jest.fn().mockResolvedValue({ data: [mockCustomer], meta: { total: 1, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false } }),
    findOne: jest.fn().mockResolvedValue(mockCustomer),
    create: jest.fn().mockResolvedValue(mockCustomer),
    update: jest.fn().mockResolvedValue({ ...mockCustomer, name: 'Jane Doe' }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [{ provide: CustomersService, useValue: mockService }],
    }).compile();

    controller = module.get(CustomersController);
    service = module.get(CustomersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated customers', async () => {
      const result = await controller.findAll({ page: 1, limit: 10 } as any);
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].email).toBe('john@test.com');
    });

    it('should pass pagination to service', async () => {
      await controller.findAll({ page: 1, limit: 10 } as any);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });

  describe('findOne', () => {
    it('should return a customer by id', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockCustomer);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new customer', async () => {
      const dto = { name: 'John Doe', email: 'john@test.com', phone: '03001234567' };
      await controller.create(dto as any);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const dto = { name: 'Jane Doe' };
      const result = await controller.update('1', dto as any);
      expect(result.name).toBe('Jane Doe');
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      await expect(controller.remove('1')).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
