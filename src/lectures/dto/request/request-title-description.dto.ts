import { IsNotEmpty, IsString } from 'class-validator';

export class RequestTitleDescriptionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
