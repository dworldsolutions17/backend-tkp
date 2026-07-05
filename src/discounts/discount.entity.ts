import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('discounts')
export class Discount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  type: string; // 'percentage' or 'fixed'

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  minOrder: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  maxDiscount: number;

  @Column({ default: 100 })
  usageLimit: number;

  @Column({ default: 0 })
  used: number;

  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'date', nullable: true })
  expiry: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
