import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

describe('UploadController', () => {
  let controller: UploadController;
  let service: UploadService;

  const mockService = {
    uploadFile: jest.fn().mockResolvedValue('/uploads/products/file.jpg'),
    uploadMultiple: jest.fn().mockResolvedValue(['/uploads/products/file1.jpg', '/uploads/products/file2.jpg']),
    removeFile: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [{ provide: UploadService, useValue: mockService }],
    }).compile();

    controller = module.get(UploadController);
    service = module.get(UploadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadSingle', () => {
    it('should upload a single file', async () => {
      const mockFile = { buffer: Buffer.from('test'), originalname: 'test.jpg' } as Express.Multer.File;
      const result = await controller.uploadSingle(mockFile, 'products');
      expect(result).toHaveProperty('url');
      expect(service.uploadFile).toHaveBeenCalledWith(mockFile, 'products');
    });

    it('should throw when no file provided', async () => {
      await expect(controller.uploadSingle(undefined as any, 'products')).rejects.toThrow();
    });
  });

  describe('uploadMultiple', () => {
    it('should upload multiple files', async () => {
      const mockFiles = [
        { buffer: Buffer.from('test1'), originalname: 'test1.jpg' },
        { buffer: Buffer.from('test2'), originalname: 'test2.jpg' },
      ] as Express.Multer.File[];
      const result = await controller.uploadMultiple(mockFiles, 'products');
      expect(result).toHaveProperty('urls');
      expect(result.urls).toHaveLength(2);
      expect(service.uploadMultiple).toHaveBeenCalledWith(mockFiles, 'products');
    });

    it('should throw when no files provided', async () => {
      await expect(controller.uploadMultiple(undefined as any, 'products')).rejects.toThrow();
    });

    it('should throw for empty array', async () => {
      await expect(controller.uploadMultiple([], 'products')).rejects.toThrow();
    });
  });
});
