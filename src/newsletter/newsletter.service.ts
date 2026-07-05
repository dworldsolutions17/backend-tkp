import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscriber } from './newsletter.entity';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterSubscriber)
    private subscriberRepository: Repository<NewsletterSubscriber>,
  ) {}

  async subscribe(dto: SubscribeDto): Promise<{ message: string; subscriber: NewsletterSubscriber }> {
    const existing = await this.subscriberRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException('This email is already subscribed to our newsletter.');
      }
      // Re-activate if previously unsubscribed
      existing.isActive = true;
      const reactivated = await this.subscriberRepository.save(existing);
      return { message: 'Welcome back! You have been re-subscribed.', subscriber: reactivated };
    }

    const subscriber = this.subscriberRepository.create({ email: dto.email, isActive: true });
    const saved = await this.subscriberRepository.save(subscriber);
    return { message: 'Thank you for subscribing! You will receive our latest updates.', subscriber: saved };
  }

  async unsubscribe(email: string): Promise<{ message: string }> {
    const subscriber = await this.subscriberRepository.findOne({ where: { email } });
    if (subscriber) {
      subscriber.isActive = false;
      await this.subscriberRepository.save(subscriber);
    }
    return { message: 'You have been unsubscribed successfully.' };
  }

  async findAll(): Promise<NewsletterSubscriber[]> {
    return this.subscriberRepository.find({
      where: { isActive: true },
      order: { subscribedAt: 'DESC' },
    });
  }

  async getStats(): Promise<{ total: number; active: number }> {
    const total = await this.subscriberRepository.count();
    const active = await this.subscriberRepository.count({ where: { isActive: true } });
    return { total, active };
  }
}
