import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Question } from './question.entity';

@Entity('translations')
export class Translation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 5 })
  languageCode: string;

  @Column({ type: 'text' })
  question_text: string;

  @Column({ type: 'simple-array' })
  options: string[];

  @ManyToOne(() => Question, question => question.translations)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column()
  questionId: number;
}
