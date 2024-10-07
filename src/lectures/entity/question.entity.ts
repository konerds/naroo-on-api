import { Common } from '../../common/entity/common.entity';
import { Lecture } from '../../lectures/entity/lecture.entity';
import { User } from '../../users/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Answer } from './answer.entity';

@Entity()
export class Question extends Common {
  @ManyToOne(() => Lecture, (lecture) => lecture.questions)
  @JoinColumn({ name: 'lectureId' })
  lecture: Lecture;

  @ManyToOne(() => User, (user) => user.questions)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column('varchar')
  title: string;

  @Column('varchar')
  description: string;

  @OneToOne(() => Answer, (answer) => answer.question)
  answer: Answer;
}
