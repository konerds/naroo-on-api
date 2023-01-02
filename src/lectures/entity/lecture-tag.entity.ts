import { Lecture } from './lecture.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Tag } from './tag.entity';

@Entity()
export class LectureTag {
  @PrimaryColumn()
  lectureId: string;

  @PrimaryColumn()
  tagId: string;

  @ManyToOne(() => Lecture, (lecture) => lecture.lectureTags, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  lecture: Lecture;

  @ManyToOne(() => Tag, (tag) => tag.lectureTags, {
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
