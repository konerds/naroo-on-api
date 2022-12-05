import { Lecture } from '../../lectures/entity/lecture.entity';
import { CreateDateColumn, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Tag } from './tag.entity';

@Entity()
export class LectureTag {
  @ManyToOne(() => Lecture, (lecture) => lecture.lectureTags, {
    primary: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  lecture: Lecture;

  @ManyToOne(() => Tag, (tag) => tag.lectureTags, {
    primary: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  tag: Tag;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}
