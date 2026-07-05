import { Injectable, Logger } from '@nestjs/common';
import { SendContactMessageDto } from './dto/send-contact-message.dto';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  async sendContactMessage(data: SendContactMessageDto): Promise<{ message: string; success: boolean }> {
    try {
      this.logger.log(`Contact message from ${data.name} (${data.email}): ${data.message}`);

      return {
        message: 'Your message has been sent successfully. We will get back to you soon!',
        success: true,
      };
    } catch (error) {
      this.logger.error(`Failed to send contact message: ${error.message}`);
      return {
        message: 'Failed to send message. Please try again or contact us directly.',
        success: false,
      };
    }
  }
}
