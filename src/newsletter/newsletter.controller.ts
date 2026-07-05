import { Controller, Post, Delete, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  async subscribe(@Body() dto: SubscribeDto) {
    return this.newsletterService.subscribe(dto);
  }

  @Delete('unsubscribe')
  @HttpCode(HttpStatus.OK)
  async unsubscribe(@Query('email') email: string) {
    return this.newsletterService.unsubscribe(email);
  }

  @Get()
  async findAll() {
    return this.newsletterService.findAll();
  }

  @Get('stats')
  async getStats() {
    return this.newsletterService.getStats();
  }
}
