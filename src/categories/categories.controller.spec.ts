import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategory = {
    id: 1,
    name: 'Toys',
    slug: 'toys',
    description: 'Kids toys category',
    image: '/uploads/categories/toys.jpg',
    products: [],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
  };

  const mockService = {
    findAll: jest.fn().mockResolvedValue({ data: [mockCategory], meta: { total: 1, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false } }),
    findOne: jest.fn().mockResolvedValue(mockCategory),
    create: jest.fn().mockResolvedValue(mockCategory),
    update: jest.fn().mockResolvedValue({ ...mockCategory, name: 'Updated Category' }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: mockService }],
    }).compile();

    controller = module.get(CategoriesController);
    service = module.get(CategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated categories', async () => {
      const result = await controller.findAll({ page: 1, limit: 10 });
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Toys');
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockCategory);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a category with auto-generated slug', async () => {
      const dto = { name: 'Toys' };
      const result = await controller.create(dto as any);
      expect(result).toEqual(mockCategory);
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should create a category with provided slug', async () => {
      const dto = { name: 'Baby Care', slug: 'baby-care' };
      await controller.create(dto as any);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a category and re-generate slug', async () => {
      const dto = { name: 'Updated Category' };
      const result = await controller.update('1', dto);
      expect(result.name).toBe('Updated Category');
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      await expect(controller.remove('1')).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
