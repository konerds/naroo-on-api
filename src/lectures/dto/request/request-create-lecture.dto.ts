import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class RequestCreateLectureDto {
  @IsString({ message: '올바른 강의 제목을 입력해주세요' })
  @IsNotEmpty({ message: '강의 제목을 입력해주세요' })
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  thumbnail: string;

  @IsString({ each: true })
  @IsOptional({ each: true })
  images: string[];

  @IsDateString()
  @IsOptional()
  expiredAt: Date;

  @IsString()
  @IsNotEmpty()
  teacherName: string;

  @IsString({ each: true })
  @IsOptional({ each: true })
  tags: string[];

  @IsString()
  @IsOptional()
  videoUrl: string;

  @IsString()
  @IsOptional()
  videoTitle: string;
}
