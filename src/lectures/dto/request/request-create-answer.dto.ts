import { IsNotEmpty, IsString } from 'class-validator';

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
