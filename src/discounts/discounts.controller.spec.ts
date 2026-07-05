import { Test, TestingModule } from '@nestjs/testing';
import { DiscountsController } from './discounts.controller';
import { DiscountsService } from './discounts.service';

describe('DiscountsController', () => {
  let controller: DiscountsController;
  let service: DiscountsService;

  const mockDiscount = {
    id: 1,
    code: 'SAVE10',
    type: 'percentage',
    value: 10,
    minOrder: 1000,
    maxDiscount: 500,
    usageLimit: 100,
    used: 5,
    status: 'active',
    expiry: new Date('2026-12-31'),
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockService = {
    findAll: jest.fn().mockResolvedValue({ data: [mockDiscount], meta: { total: 1, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false } }),
    findOne: jest.fn().mockResolvedValue(mockDiscount),
    findByCode: jest.fn().mockResolvedValue(mockDiscount),
    create: jest.fn().mockResolvedValue(mockDiscount),
    update: jest.fn().mockResolvedValue({ ...mockDiscount, value: 20 }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountsController],
      providers: [{ provide: DiscountsService, useValue: mockService }],
    }).compile();

    controller = module.get(DiscountsController);
    service = module.get(DiscountsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated discounts', async () => {
      const result = await controller.findAll({ page: 1, limit: 10 });
      expect(result).toHaveProperty('data');
      expect(result.data[0].code).toBe('SAVE10');
    });
  });

  describe('findOne', () => {
    it('should return a discount by id', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockDiscount);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findByCode', () => {
    it('should find discount by coupon code', async () => {
      const result = await controller.findByCode('SAVE10');
      expect(result).toEqual(mockDiscount);
      expect(service.findByCode).toHaveBeenCalledWith('SAVE10');
    });
  });

  describe('create', () => {
    it('should create a new discount', async () => {
      const dto = { code: 'SAVE10', type: 'percentage', value: 10, status: 'active' };
      await controller.create(dto as any);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a discount', async () => {
      const dto = { value: 20 };
      const result = await controller.update('1', dto as any);
      expect(result.value).toBe(20);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should delete a discount', async () => {
      await expect(controller.remove('1')).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
