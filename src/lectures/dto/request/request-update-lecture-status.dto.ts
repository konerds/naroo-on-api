import { IsEnum } from 'class-validator';
import {
  CONST_LECTURE_STATUS,
  LECTURE_STATUS,
} from '../../entity/student-lecture.entity';

export class RequestUpdateLectureStatusDto {
  @IsEnum(CONST_LECTURE_STATUS)
  status: LECTURE_STATUS;
}
