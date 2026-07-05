import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, product => product.id)
  product: Product;

  @Column({ nullable: true })
  productId: number;

  @ManyToOne(() => Customer, customer => customer.id, { nullable: true })
  customer: Customer;

  @Column({ nullable: true })
  customerId: number;

  @Column()
  customerName: string;

  @Column({ nullable: true })
  customerLocation: string;

  @Column('text')
  text: string;

  @Column('decimal', { precision: 2, scale: 1, default: 5.0 })
  rating: number;

  @Column({ default: false })
  isTestimonial: boolean;

  @Column({ default: false })
  isApproved: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
