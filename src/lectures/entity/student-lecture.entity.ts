import { Lecture } from './lecture.entity';
import { User } from '../../users/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Common } from '../../common/entity/common.entity';

export const CONST_LECTURE_STATUS = {
  APPLY: 'apply',
  REJECT: 'reject',
  INVISIBLE: 'invisible',
  ACCEPT: 'accept',
  VISIBLE: null,
} as const;

export type LECTURE_STATUS =
  (typeof CONST_LECTURE_STATUS)[keyof typeof CONST_LECTURE_STATUS];

@Entity()
export class StudentLecture extends Common {
  @ManyToOne(() => User, (user) => user.studentLectures, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Lecture, (lecture) => lecture.studentLectures, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lectureId' })
  lecture: Lecture;

  @Column('varchar', {
    default: null,
    nullable: true,
  })
  status: LECTURE_STATUS;
}
