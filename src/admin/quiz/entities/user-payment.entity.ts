import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from 'src/auth/entites/user.entity';
import { Tier } from './tier.entity';

@Entity('user_payments')
export class UserPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  paymentDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'usd' })
  currency: string;

  @ManyToOne(() => User, user => user.payments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Tier, tier => tier.payments)
  @JoinColumn({ name: 'tier_id' })
  tier: Tier;

  @Column()
  tierId: number;

  @Column({ nullable: true })
  expiryDate: Date;

  @Column({ default: true })
  isActive: boolean;
}