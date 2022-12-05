import { IsNotEmpty, IsString } from 'class-validator';

export class RequestTagIdDto {
  @IsString()
  @IsNotEmpty()
  tag_id: string;
}
