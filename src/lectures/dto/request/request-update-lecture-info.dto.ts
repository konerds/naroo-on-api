import { IsDateString, IsOptional, IsString } from 'class-validator';

export class RequestUpdateLectureInfoDto {
  @IsOptional()
  thumbnail: any;

  @IsDateString()
  @IsOptional()
  expired: Date;

  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  teacherName: string;

  @IsString()
  @IsOptional()
  img_description_index: string;

  @IsOptional()
  img_description: any;

  @IsString()
  @IsOptional()
  video_title: string;

  @IsString()
  @IsOptional()
  video_url: string;
}
