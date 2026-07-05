import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: ReviewsService;

  const mockReview = {
    id: 1,
    productId: 1,
    customerId: 1,
    customerName: 'John',
    rating: 5,
    comment: 'Great product!',
    status: 'pending',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockService = {
    findAll: jest.fn().mockResolvedValue([mockReview]),
    findByProduct: jest.fn().mockResolvedValue([mockReview]),
    findOne: jest.fn().mockResolvedValue(mockReview),
    create: jest.fn().mockResolvedValue(mockReview),
    approve: jest.fn().mockResolvedValue({ ...mockReview, status: 'approved' }),
    remove: jest.fn().mockResolvedValue(undefined),
    findTestimonials: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [{ provide: ReviewsService, useValue: mockService }],
    }).compile();

    controller = module.get(ReviewsController);
    service = module.get(ReviewsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all reviews', async () => {
      const result = await controller.findAll({ page: 1, limit: 10 } as any, {} as any);
      expect(result).toHaveLength(1);
      expect(result[0].rating).toBe(5);
    });
  });

  describe('findByProduct', () => {
    it('should return reviews for a product', async () => {
      const result = await controller.findByProduct('1', undefined);
      expect(result).toHaveLength(1);
      expect(service.findByProduct).toHaveBeenCalledWith(1, true);
    });
  });

  describe('create', () => {
    it('should create a new review', async () => {
      const dto = { productId: 1, customerId: 1, rating: 5, comment: 'Great!' };
      await controller.create(dto as any);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('approve', () => {
    it('should approve a review', async () => {
      const result: any = await controller.approve('1');
      expect(result.status).toBe('approved');
      expect(service.approve).toHaveBeenCalledWith(1);
    });
  });

  describe('remove', () => {
    it('should delete a review', async () => {
      await expect(controller.remove('1')).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
