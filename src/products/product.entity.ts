import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Category } from '../categories/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  @ManyToOne(() => Category, category => category.products)
  category: Category;

  @Column()
  categoryId: number;

  @Column({ default: 0 })
  stock: number;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  sku: string;

  @Column({ nullable: true })
  badge: string;

  @Column('decimal', { precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ default: 0 })
  discount: number;

  @Column({ default: true })
  inStock: boolean;

  @Column({ default: 'active' })
  status: string;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: false })
  isBestSeller: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
