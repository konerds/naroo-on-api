import { IsNotEmpty, IsString } from 'class-validator';

export class RequestNoticeIdDto {
  @IsString()
  @IsNotEmpty()
  notice_id: string;
}
