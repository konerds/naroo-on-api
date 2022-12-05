import { PickType } from '@nestjs/swagger';
import { Lecture } from '../../entity/lecture.entity';

export class ResponseCreateLectureDto extends PickType(Lecture, [
  'title',
  'thumbnail',
  'images',
  'expiredAt',
  'teacherName',
]) {}
