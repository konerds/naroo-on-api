import { IsNotEmpty, IsString } from 'class-validator';

export class RequestTitleDescriptionDto {
  @IsString()
  @IsNotEmpty({ message: '제목을 입력해주세요' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '설명을 입력해주세요' })
  description: string;
}
