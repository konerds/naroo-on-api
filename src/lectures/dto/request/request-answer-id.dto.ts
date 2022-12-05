import { IsNotEmpty, IsString } from 'class-validator';

export class RequestAnswerIdDto {
  @IsString()
  @IsNotEmpty()
  answer_id: string;
}
