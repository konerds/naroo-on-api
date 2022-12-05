import { IsDateString, IsOptional, IsString } from 'class-validator';

export class RequestUpdateLectureInfoDto {
  @IsString()
  @IsOptional()
  thumbnail: string;

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

  @IsString()
  @IsOptional()
  img_description: string;

  @IsString()
  @IsOptional()
  video_title: string;

  @IsString()
  @IsOptional()
  video_url: string;
}
