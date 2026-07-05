import { Test, TestingModule } from '@nestjs/testing';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';

describe('WishlistController', () => {
  let controller: WishlistController;
  let service: WishlistService;

  const mockWishlistItem = {
    id: 1,
    customerId: 1,
    productId: 1,
    product: { id: 1, name: 'Test Toy', price: 999 },
    createdAt: new Date('2026-01-01'),
  };

  const mockService = {
    findByCustomer: jest.fn().mockResolvedValue([mockWishlistItem]),
    add: jest.fn().mockResolvedValue(mockWishlistItem),
    remove: jest.fn().mockResolvedValue(undefined),
    removeByProduct: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistController],
      providers: [{ provide: WishlistService, useValue: mockService }],
    }).compile();

    controller = module.get(WishlistController);
    service = module.get(WishlistService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findByCustomer', () => {
    it('should return customer wishlist items', async () => {
      const result = await controller.findByCustomer('1');
      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe(1);
      expect(service.findByCustomer).toHaveBeenCalledWith(1);
    });
  });

  describe('add', () => {
    it('should add product to wishlist', async () => {
      const dto = { customerId: 1, productId: 1 };
      const result = await controller.add(dto as any);
      expect(result).toEqual(mockWishlistItem);
      expect(service.add).toHaveBeenCalledWith(dto);
    });
  });

  describe('remove', () => {
    it('should remove a wishlist item by id', async () => {
      await expect(controller.remove('1')).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('removeByProduct', () => {
    it('should remove product from wishlist by customer and product id', async () => {
      await expect(controller.removeByProduct('1', '1')).resolves.toBeUndefined();
      expect(service.removeByProduct).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('clear', () => {
    it('should clear entire wishlist', async () => {
      await expect(controller.clear('1')).resolves.toBeUndefined();
      expect(service.clear).toHaveBeenCalledWith(1);
    });
  });
});
