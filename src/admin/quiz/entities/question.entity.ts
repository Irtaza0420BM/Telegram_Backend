import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Category } from './category.entity';
import { Tier } from './tier.entity';
import { Translation } from './translation.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  question_text: string;

  @Column({ type: 'simple-array' })
  options: string[];

  @Column({ type: 'int' })
  correct_option_index: number;

  @ManyToOne(() => Category, category => category.questions)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column()
  categoryId: number;

  @ManyToOne(() => Tier, tier => tier.questions)
  @JoinColumn({ name: 'tier_id' })
  tier: Tier;

  @Column()
  tierId: number;

  @OneToMany(() => Translation, translation => translation.question)
  translations: Translation[];
}