import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Product } from '../products/product.entity';

@Entity('inventory_movements')
export class InventoryMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  productId: number;

  @Column()
  type: string; // 'in', 'out', 'adjustment', 'return', 'damaged'

  @Column()
  quantity: number;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  reference: string; // Order number, supplier reference, etc.

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  performedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
