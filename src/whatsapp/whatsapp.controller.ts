import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { SendContactMessageDto } from './dto/send-contact-message.dto';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('contact')
  @HttpCode(HttpStatus.OK)
  async sendContactMessage(@Body() dto: SendContactMessageDto) {
    return this.whatsappService.sendContactMessage(dto);
  }
}
