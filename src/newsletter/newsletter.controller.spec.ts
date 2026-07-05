import { Test, TestingModule } from '@nestjs/testing';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';

describe('NewsletterController', () => {
  let controller: NewsletterController;
  let service: NewsletterService;

  const mockSubscription = {
    id: 1,
    email: 'subscriber@test.com',
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockService = {
    subscribe: jest.fn().mockResolvedValue({ message: 'Subscribed successfully', subscriber: mockSubscription }),
    unsubscribe: jest.fn().mockResolvedValue({ message: 'Unsubscribed successfully' }),
    findAll: jest.fn().mockResolvedValue([mockSubscription]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsletterController],
      providers: [{ provide: NewsletterService, useValue: mockService }],
    }).compile();

    controller = module.get(NewsletterController);
    service = module.get(NewsletterService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('subscribe', () => {
    it('should subscribe an email', async () => {
      const dto = { email: 'subscriber@test.com' };
      const result = await controller.subscribe(dto as any);
      expect(result.message).toBe('Subscribed successfully');
      expect(result.subscriber).toEqual(mockSubscription);
      expect(service.subscribe).toHaveBeenCalledWith(dto);
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe an email', async () => {
      const result = await controller.unsubscribe('subscriber@test.com');
      expect(result.message).toBe('Unsubscribed successfully');
      expect(service.unsubscribe).toHaveBeenCalledWith('subscriber@test.com');
    });
  });

  describe('findAll', () => {
    it('should list subscribers', async () => {
      const result = await controller.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('subscriber@test.com');
    });
  });
});
