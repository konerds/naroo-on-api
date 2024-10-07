import { Common } from '../../common/entity/common.entity';
import { Lecture } from './lecture.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class LectureNotice extends Common {
  @ManyToOne(() => Lecture, (lecture) => lecture.lectureNotices, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lectureId' })
  lecture: Lecture;

  @Column('varchar')
  title: string;

  @Column('varchar')
  description: string;
}
