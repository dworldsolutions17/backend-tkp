import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @ApiOperation({ summary: 'Send a message to the AI assistant' })
  async sendMessage(
    @Body('message') message: string,
    @Body('sessionId') sessionId: string,
    @Body('customerId') customerId?: number,
    @Body('customerName') customerName?: string,
  ) {
    return this.chatService.chat(message, sessionId, customerId, customerName);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversation threads (CMS)' })
  async getConversations(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getConversations(page || 1, limit || 20);
  }

  @Get('conversations/:sessionId')
  @ApiOperation({ summary: 'Get messages for a specific conversation' })
  async getConversation(@Param('sessionId') sessionId: string) {
    return this.chatService.getConversation(sessionId);
  }
}
