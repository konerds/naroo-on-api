import { Common } from '../../common/entity/common.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { LectureTag } from './lecture-tag.entity';

@Entity()
export class Tag extends Common {
  @OneToMany(() => LectureTag, (lectureTag) => lectureTag.tag)
  lectureTags: LectureTag[];

  @Column('varchar', { unique: true })
  name: string;
}
