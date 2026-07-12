import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Groq from 'groq-sdk';
import { ChatMessage } from './chat-message.entity';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private groq: Groq;

  constructor(
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
  ) {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async getConversations(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const qb = this.chatMessageRepository
      .createQueryBuilder('m')
      .select('m.sessionId', 'sessionId')
      .addSelect('MAX(m.createdAt)', 'lastMsg')
      .addSelect('COUNT(m.id)', 'msgCount')
      .addSelect('MIN(m.customerName)', 'custName')
      .addSelect('MIN(m.customerId)', 'custId')
      .groupBy('m.sessionId')
      .orderBy('"lastMsg"', 'DESC')
      .offset(skip)
      .limit(limit);

    const [results, total] = await Promise.all([
      qb.getRawMany(),
      this.chatMessageRepository
        .createQueryBuilder('m')
        .select('COUNT(DISTINCT m.sessionId)', 'count')
        .getRawOne(),
    ]);

    return {
      data: results,
      meta: {
        total: parseInt(total?.count || '0'),
        page,
        limit,
        totalPages: Math.ceil(parseInt(total?.count || '0') / limit),
        hasNextPage: page * limit < parseInt(total?.count || '0'),
        hasPreviousPage: page > 1,
      },
    };
  }

  async getConversation(sessionId: string) {
    return this.chatMessageRepository.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });
  }

  async chat(
    message: string,
    sessionId: string,
    customerId?: number,
    customerName?: string,
  ) {
    try {
      // Save user message
      await this.chatMessageRepository.save({
        sessionId,
        customerId,
        customerName,
        role: 'user',
        content: message,
      });

      // Get recent history
      const history = await this.chatMessageRepository.find({
        where: { sessionId },
        order: { createdAt: 'DESC' },
        take: 20,
      });

      const recentMessages = history.reverse().map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const systemPrompt = `You are The Kidz Planet's friendly AI shopping assistant for our kids' products store in Pakistan.

Store Information:
- Website: thekidzplanet.pk
- WhatsApp: 0335 8446393
- Email: thekidzplannetpk@gmail.com
- Free shipping on orders over Rs.3,000
- Cash on Delivery (COD) payment
- 7-day easy returns policy
- Delivery within 3-7 business days across Pakistan

Product Categories we sell:
- Toys (educational, action figures, dolls, building blocks, puzzles, outdoor toys)
- Baby Care (diapers, wipes, feeding bottles, baby hygiene, strollers, carriers)
- Accessories (hair clips, bags, watches, sunglasses, jewelry for kids)
- Party Supplies (balloons, decorations, party favors, birthday themed items)
- Sports & Outdoor (bikes, scooters, sports gear, swimming accessories, play tents)
- Furniture & Decor (kids beds, study tables, storage, wall decor, rugs)
- Feeding & Nursing (bottles, bibs, high chairs, breast pumps, sterilizers)
- Educational Supplies (books, stationery, art supplies, learning kits, flashcards)

Your Role:
1. Greet warmly and ask how you can help
2. Recommend products based on child's age, interests, and needs
3. Help find gifts for specific occasions (birthdays, baby showers)
4. Provide pricing estimates (most products range Rs.300 - Rs.8,000)
5. Share our policies (COD, free shipping over Rs.3,000, 7-day returns)
6. Direct them to specific product categories
7. Always mention they can order via WhatsApp (0335 8446393)
8. Keep responses friendly, enthusiastic, and helpful - use emojis occasionally
9. Keep responses concise (2-4 sentences) unless detailed info is requested

Tone: Warm, motherly/friendly, enthusiastic about kids products, trustworthy.`;

      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...recentMessages,
        ],
        temperature: 0.7,
        max_tokens: 512,
      });

      const reply = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t process that.';

      // Save assistant reply
      await this.chatMessageRepository.save({
        sessionId,
        customerId,
        customerName,
        role: 'assistant',
        content: reply,
      });

      return { reply };
    } catch (error) {
      this.logger.error('Chat error:', error);
      return {
        reply: 'Oops! I\'m having trouble connecting. Please try again in a moment, or reach us on WhatsApp at 0335 8446393! 😊',
      };
    }
  }
}
