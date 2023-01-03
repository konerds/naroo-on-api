import { IsNotEmpty, IsString } from 'class-validator';

export class RequestTagNameDto {
  @IsString()
  @IsNotEmpty({ message: '태그 이름을 입력해주세요' })
  name: string;
}
