import { IsNotEmpty, IsString } from 'class-validator';

export class RequestTagNameDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
