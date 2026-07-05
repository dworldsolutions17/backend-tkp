import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Order } from '../orders/order.entity';
import { Wishlist } from '../wishlist/wishlist.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  city: string;

  @Column('text', { nullable: true })
  address: string;

  @Column({ nullable: true })
  password: string;

  @Column({ type: 'enum', enum: ['admin', 'customer'], default: 'customer' })
  role: 'admin' | 'customer';

  @OneToMany(() => Order, order => order.customer)
  orders: Order[];

  @OneToMany(() => Wishlist, wishlist => wishlist.customer)
  wishlist: Wishlist[];

  @CreateDateColumn()
  joinedDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
