import { Lecture } from '../../lectures/entity/lecture.entity';
import { User } from '../../users/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

export const CONST_LECTURE_STATUS = {
  APPLY: 'apply',
  REJECT: 'reject',
  INVISIBLE: 'invisible',
  ACCEPT: 'accept',
  VISIBLE: null,
} as const;

export type LECTURE_STATUS =
  typeof CONST_LECTURE_STATUS[keyof typeof CONST_LECTURE_STATUS];

@Entity()
export class StudentLecture {
  @ManyToOne(() => User, (user) => user.studentLectures, {
    primary: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Lecture, (lecture) => lecture.studentLectures, {
    primary: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  lecture: Lecture;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column('enum', {
    enum: CONST_LECTURE_STATUS,
    default: null,
    nullable: true,
  })
  status: LECTURE_STATUS;
}
