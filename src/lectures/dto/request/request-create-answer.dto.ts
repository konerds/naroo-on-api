import { IsNotEmpty, IsString } from 'class-validator';

export class RequestCreateAnswerDto {
  @IsString()
  @IsNotEmpty()
  question_id: string;

  @IsString()
  @IsNotEmpty({ message: '답변 제목을 입력해주세요' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '답변 설명을 입력해주세요' })
  description: string;
}
