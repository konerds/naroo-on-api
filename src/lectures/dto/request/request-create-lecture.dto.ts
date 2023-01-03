import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class RequestCreateLectureDto {
  @IsString()
  @IsNotEmpty({ message: '강의 제목을 입력해주세요' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '강의 설명을 입력해주세요' })
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
  @IsNotEmpty({ message: '강사 이름을 입력해주세요' })
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
