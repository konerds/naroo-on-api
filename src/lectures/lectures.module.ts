import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entity/user.entity';
import { Answer } from './entity/answer.entity';
import { Lecture } from './entity/lecture.entity';
import { LectureNotice } from './entity/lecture-notice.entity';
import { LectureTag } from './entity/lecture-tag.entity';
import { Question } from './entity/question.entity';
import { StudentLecture } from './entity/student-lecture.entity';
import { Tag } from './entity/tag.entity';
import { LecturesController } from './lectures.controller';
import { LecturesService } from './lectures.service';
import { factoryOptionMulterS3AWS } from '../common/factory/option-multer-s3-aws.factory';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lecture,
      LectureTag,
      LectureNotice,
      Question,
      Answer,
      StudentLecture,
      Tag,
      User,
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
    MulterModule.registerAsync({
      useFactory: factoryOptionMulterS3AWS,
      inject: [ConfigService],
    }),
  ],
  controllers: [LecturesController],
  providers: [LecturesService],
})
export class LecturesModule {}
