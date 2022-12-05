import { IsNotEmpty, IsString } from 'class-validator';

export class RequestQuestionIdDto {
  @IsString()
  @IsNotEmpty()
  question_id: string;
}
