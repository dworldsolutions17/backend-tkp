import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProduct = {
    id: 1,
    name: 'Test Toy',
    slug: 'test-toy',
    description: 'A test toy',
    price: 999,
    originalPrice: 1299,
    stock: 50,
    status: 'active',
    images: ['/uploads/products/img.jpg'],
    categoryId: 1,
    category: { id: 1, name: 'Toys', slug: 'toys' },
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
  };

  const mockService = {
    findAll: jest.fn().mockResolvedValue({ data: [mockProduct], meta: { total: 1, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false } }),
    findOne: jest.fn().mockResolvedValue(mockProduct),
    create: jest.fn().mockResolvedValue(mockProduct),
    update: jest.fn().mockResolvedValue({ ...mockProduct, name: 'Updated Toy' }),
    remove: jest.fn().mockResolvedValue(undefined),
    exportToCSV: jest.fn().mockResolvedValue('csv,data'),
    importFromCSV: jest.fn().mockResolvedValue({ created: 2, errors: [] }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockService }],
    }).compile();

    controller = module.get(ProductsController);
    service = module.get(ProductsService);
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const result = await controller.findAll({ page: 1, limit: 10 } as any);
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Test Toy');
    });

    it('should pass search filter to service', async () => {
      await controller.findAll({ page: 1, limit: 10, search: 'toy' } as any);
      expect(service.findAll).toHaveBeenCalledWith(
        { page: 1, limit: 10, search: 'toy' },
        { page: 1, limit: 10, search: 'toy' },
      );
    });

    it('should pass category filter to service', async () => {
      await controller.findAll({ page: 1, limit: 10, categoryId: 1 } as any);
      expect(service.findAll).toHaveBeenCalledWith(
        { page: 1, limit: 10, categoryId: 1 },
        { page: 1, limit: 10, categoryId: 1 },
      );
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockProduct);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const dto = { name: 'Test Toy', price: 999, stock: 50, categoryId: 1, images: [] };
      const result = await controller.create(dto as any);
      expect(result).toEqual(mockProduct);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const dto = { name: 'Updated Toy' };
      const result = await controller.update('1', dto);
      expect(result.name).toBe('Updated Toy');
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      await expect(controller.remove('1')).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
