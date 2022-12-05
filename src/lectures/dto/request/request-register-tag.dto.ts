import { IsArray, IsNotEmpty } from 'class-validator';

export class RequestRegisterTagDto {
  @IsArray()
  @IsNotEmpty()
  ids: string[];
}
