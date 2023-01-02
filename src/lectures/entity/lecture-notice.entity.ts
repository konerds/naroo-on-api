import { Common } from '../../common/entity/common.entity';
import { Lecture } from './lecture.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class LectureNotice extends Common {
  @PrimaryColumn()
  lectureId: string;

  @ManyToOne(() => Lecture, (lecture) => lecture.lectureNotices, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  lecture: Lecture;

  @Column('varchar')
  title: string;

  @Column('varchar')
  description: string;
}
