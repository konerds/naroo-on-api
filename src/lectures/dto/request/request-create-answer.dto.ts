import { IsNotEmpty, IsString } from 'class-validator';
import { RequestTitleDescriptionDto } from './request-title-description.dto';

export class RequestCreateAnswerDto {
  @IsString()
  @IsNotEmpty()
  question_id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
