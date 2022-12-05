import { Common } from '../../common/entity/common.entity';
import { Question } from '../../lectures/entity/question.entity';
import { StudentLecture } from '../../lectures/entity/studentLecture.entity';
import { Column, Entity, OneToMany } from 'typeorm';

export const CONST_ROLE_TYPE = {
  ADMIN: 'admin',
  STUDENT: 'student',
} as const;

export type ROLE_TYPE = typeof CONST_ROLE_TYPE[keyof typeof CONST_ROLE_TYPE];

@Entity()
export class User extends Common {
  @Column('varchar', { unique: true })
  email: string;

  @Column('varchar', { unique: true })
  nickname: string;

  @Column('varchar')
  password: string;

  @Column('varchar', { unique: true })
  phone: string;

  @Column('enum', { enum: CONST_ROLE_TYPE, default: CONST_ROLE_TYPE.STUDENT })
  role: ROLE_TYPE;

  @Column('boolean', { default: false })
  isAgreeEmail: boolean;

  @Column('boolean', { default: false })
  isAuthorized: boolean;

  @Column('varchar', { default: null, unique: true })
  verifyToken: string;

  @OneToMany(() => StudentLecture, (studentLecture) => studentLecture.user)
  studentLectures: StudentLecture[];

  @OneToMany(() => Question, (question) => question.student)
  questions: Question[];
}
