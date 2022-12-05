import { Common } from '../../common/entity/common.entity';
import { Lecture } from '../../lectures/entity/lecture.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class LectureNotice extends Common {
  @ManyToOne(() => Lecture, (lecture) => lecture.lectureNotices, {
    primary: true,
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
