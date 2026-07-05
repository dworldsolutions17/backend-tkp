import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';

describe('WhatsappController', () => {
  let controller: WhatsappController;
  let service: WhatsappService;

  const mockMessage = {
    id: 1,
    name: 'John Doe',
    email: 'john@test.com',
    phone: '03001234567',
    subject: 'Product Inquiry',
    message: 'I have a question about your products.',
    createdAt: new Date('2026-01-01'),
  };

  const mockService = {
    sendContactMessage: jest.fn().mockResolvedValue({ success: true, message: 'Message sent successfully' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhatsappController],
      providers: [{ provide: WhatsappService, useValue: mockService }],
    }).compile();

    controller = module.get(WhatsappController);
    service = module.get(WhatsappService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendContactMessage', () => {
    it('should send a contact message', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john@test.com',
        phone: '03001234567',
        subject: 'Product Inquiry',
        message: 'I have a question about your products.',
      };
      const result = await controller.sendContactMessage(dto as any);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Message sent successfully');
      expect(service.sendContactMessage).toHaveBeenCalledWith(dto);
    });
  });
});
