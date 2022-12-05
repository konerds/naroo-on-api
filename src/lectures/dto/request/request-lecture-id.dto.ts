import { IsNotEmpty, IsString } from 'class-validator';

export class RequestLectureIdDto {
  @IsString()
  @IsNotEmpty()
  lectureId: string;
}
