import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Product } from '../products/product.entity';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  productId: number;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  sku: string;

  @Column({ default: 0 })
  incoming: number;

  @Column({ default: 0 })
  unavailable: number;

  @Column({ default: 0 })
  committed: number;

  @Column({ default: 0 })
  available: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
