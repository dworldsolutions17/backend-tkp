import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sessionId: string;

  @Column({ nullable: true })
  customerId: number;

  @Column({ nullable: true })
  customerName: string;

  @Column()
  role: string; // 'user' | 'assistant'

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
