import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Question } from './question.entity';
import { UserPayment } from './user-payment.entity';

@Entity('tiers')
export class Tier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ default: 1 })
  orderRank: number;

  @OneToMany(() => Question, question => question.tier)
  questions: Question[];

  @OneToMany(() => UserPayment, payment => payment.tier)
  payments: UserPayment[];
}