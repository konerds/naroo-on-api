import { Lecture } from './lecture.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Tag } from './tag.entity';
import { Common } from '../../common/entity/common.entity';

@Entity()
export class LectureTag extends Common {
  @ManyToOne(() => Lecture, (lecture) => lecture.lectureTags, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lectureId' })
  lecture: Lecture;

  @ManyToOne(() => Tag, (tag) => tag.lectureTags, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tagId' })
  tag: Tag;
}
