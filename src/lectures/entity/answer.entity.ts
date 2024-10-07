import { Common } from '../../common/entity/common.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Question } from './question.entity';

@Entity()
export class Answer extends Common {
  @OneToOne(() => Question, (question) => question.answer, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column('varchar')
  title: string;

  @Column('varchar')
  description: string;
}
