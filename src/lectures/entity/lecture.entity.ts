import { Common } from '../../common/entity/common.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { LectureNotice } from './lectureNotice.entity';
import { LectureTag } from './lectureTag.entity';
import { Question } from './question.entity';
import { StudentLecture } from './studentLecture.entity';

@Entity()
export class Lecture extends Common {
  @Column('varchar', { unique: true })
  title: string;

  @Column('varchar')
  description: string;

  @Column('varchar', {
    default:
      'https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png',
  })
  thumbnail: string;

  @Column('varchar', { array: true, default: [] })
  images: string[];

  @Column('timestamp', { default: null })
  expiredAt: Date;

  @Column('varchar')
  teacherName: string;

  @Column('varchar')
  videoUrl: string;

  @Column('varchar')
  videoTitle: string;

  @OneToMany(() => StudentLecture, (studentLecture) => studentLecture.lecture)
  studentLectures: StudentLecture[];

  @OneToMany(() => Question, (question) => question.lecture)
  questions: Question[];

  @OneToMany(() => LectureTag, (lectureTag) => lectureTag.lecture)
  lectureTags: LectureTag[];

  @OneToMany(() => LectureNotice, (lectureNotice) => lectureNotice.lecture)
  lectureNotices: LectureNotice[];
}
