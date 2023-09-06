import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { JwtAuthGuard } from '../users/guard/jwt.guard';
import { RequestCreateLectureDto } from './dto/request/request-create-lecture.dto';
import { LecturesService } from './lectures.service';
import { GetUser } from '../users/decorator/get-user.decorator';
import { User } from '../users/entity/user.entity';
import { AdminUserGuard } from '../users/guard/admin-user.guard';
import { StudentUserGuard } from '../users/guard/student-user.guard';
import { RequestUpdateLectureInfoDto } from './dto/request/request-update-lecture-info.dto';
import { RequestLectureIdDto } from './dto/request/request-lecture-id.dto';
import { RequestUserIdDto } from './dto/request/request-user-id.dto';
import { RequestUpdateLectureStatusDto } from './dto/request/request-update-lecture-status.dto';
import { RequestTagNameDto } from './dto/request/request-tag-name.dto';
import { RequestTagIdDto } from './dto/request/request-tag-id.dto';
import { RequestRegisterTagDto } from './dto/request/request-register-tag.dto';
import { RequestTitleDescriptionDto } from './dto/request/request-title-description.dto';
import { RequestCreateAnswerDto } from './dto/request/request-create-answer.dto';
import { RequestAnswerIdDto } from './dto/request/request-answer-id.dto';
import { RequestNoticeIdDto } from './dto/request/request-notice-id.dto';
import { RequestQuestionIdDto } from './dto/request/request-question-id.dto';
import { ErrorsInterceptor } from '../interceptors/errors.interceptor';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('lecture')
@UseInterceptors(ErrorsInterceptor)
export class LecturesController {
  constructor(private readonly lecturesService: LecturesService) {}

  @Post('/create')
  @UseGuards(AdminUserGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'images[]', maxCount: 5 },
    ]),
  )
  createLecture(
    @UploadedFiles() files: Express.MulterS3.File[],
    @Body() requestCreateLectureDto: RequestCreateLectureDto,
  ) {
    const { thumbnail } = JSON.parse(JSON.stringify(files));
    const images = JSON.parse(JSON.stringify(files))['images[]'];
    return this.lecturesService.createLecture({
      ...requestCreateLectureDto,
      thumbnail: thumbnail[0].location,
      images: images.map((_e) => {
        return _e.location;
      }),
    });
  }

  @Put('/admin/:lectureId')
  @UseGuards(AdminUserGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'img_description', maxCount: 1 },
    ]),
  )
  updateLectureInfo(
    @Param() pathParam: RequestLectureIdDto,
    @UploadedFiles() files: Express.MulterS3.File[],
    @Body()
    requestUpdateLectureInfoDto: RequestUpdateLectureInfoDto,
  ) {
    const { thumbnail, img_description } = JSON.parse(JSON.stringify(files));
    return this.lecturesService.updateLectureInfo(pathParam, {
      ...requestUpdateLectureInfoDto,
      thumbnail:
        !!thumbnail && thumbnail[0] && thumbnail[0].location
          ? thumbnail[0].location
          : requestUpdateLectureInfoDto.thumbnail,
      img_description:
        !!img_description &&
        !!img_description[0] &&
        !!img_description[0].location
          ? img_description[0].location
          : requestUpdateLectureInfoDto.img_description,
    });
  }

  @Delete('/admin/:lectureId')
  @UseGuards(AdminUserGuard)
  deleteLecture(@Param() pathParam: RequestLectureIdDto) {
    return this.lecturesService.deleteLecture(pathParam);
  }

  @Get('/all')
  getAllLectures() {
    return this.lecturesService.getAllLectures();
  }

  @Get('/guest/:lectureId')
  getLectureByIdGuest(@Param() pathParam: RequestLectureIdDto) {
    return this.lecturesService.getLectureByIdForGuest(pathParam);
  }

  @Get('/:lectureId')
  @UseGuards(JwtAuthGuard)
  getLectureById(
    @GetUser() user: User,
    @Param() pathParam: RequestLectureIdDto,
  ) {
    return this.lecturesService.getLectureById(user, pathParam);
  }

  @Get('/video/:lectureId')
  @UseGuards(JwtAuthGuard)
  getLectureVideoById(
    @GetUser() user: User,
    @Param() pathParam: RequestLectureIdDto,
  ) {
    return this.lecturesService.getLectureVideoById(user, pathParam);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getLectures(@GetUser() user: User) {
    return this.lecturesService.getLectures(user);
  }

  @Get('/admin/status')
  @UseGuards(AdminUserGuard)
  getStatusLectures() {
    return this.lecturesService.getStatusLectures();
  }

  @Put('/:lectureId')
  @UseGuards(StudentUserGuard)
  connectUserWithLecture(
    @Param() pathParam: RequestLectureIdDto,
    @GetUser() user: User,
  ) {
    return this.lecturesService.connectUserWithLecture(pathParam, user);
  }

  @Put('/admin/status/:lectureId')
  @UseGuards(AdminUserGuard)
  updateStatusLecture(
    @Param() pathParam: RequestLectureIdDto,
    @Query() queryParam: RequestUserIdDto,
    @Body() requestUpdateLectureStatus: RequestUpdateLectureStatusDto,
  ) {
    return this.lecturesService.updateStatusLecture(
      pathParam,
      queryParam,
      requestUpdateLectureStatus,
    );
  }

  @Post('/admin/tag/create')
  @UseGuards(AdminUserGuard)
  createTag(@Body() requestTagNameDto: RequestTagNameDto) {
    return this.lecturesService.createTag(requestTagNameDto);
  }

  @Get('/admin/tag')
  @UseGuards(AdminUserGuard)
  getAllTags() {
    return this.lecturesService.getAllTags();
  }

  @Get('/tag/:lectureId')
  getTags(@Param() pathParam: RequestLectureIdDto) {
    return this.lecturesService.getTags(pathParam);
  }

  @Put('/admin/tag/:tag_id')
  @UseGuards(AdminUserGuard)
  updateTag(
    @Param() pathParam: RequestTagIdDto,
    @Body() requestTagNameDto: RequestTagNameDto,
  ) {
    return this.lecturesService.updateTag(pathParam, requestTagNameDto);
  }

  @Delete('/admin/tag/:tag_id')
  @UseGuards(AdminUserGuard)
  deleteTag(@Param() pathParam: RequestTagIdDto) {
    return this.lecturesService.deleteTag(pathParam);
  }

  @Put('/admin/tag/register/:lectureId')
  @UseGuards(AdminUserGuard)
  connectTagToLecture(
    @Param() pathParam: RequestLectureIdDto,
    @Body() requestRegisterTagDto: RequestRegisterTagDto,
  ) {
    return this.lecturesService.connectTagToLecture(
      pathParam,
      requestRegisterTagDto,
    );
  }

  @Delete('/admin/tag/unregister/:lectureId')
  @UseGuards(AdminUserGuard)
  disconnectTagFromLecture(
    @Param() pathParam: RequestLectureIdDto,
    @Query() queryParam: RequestTagIdDto,
  ) {
    return this.lecturesService.disconnectTagFromLecture(pathParam, queryParam);
  }

  @Put('/admin/notice/:lectureId')
  @UseGuards(AdminUserGuard)
  createNotice(
    @Param() pathParam: RequestLectureIdDto,
    @GetUser() user: User,
    @Body()
    requestTitleDescriptionDto: RequestTitleDescriptionDto,
  ) {
    return this.lecturesService.createNotice(
      pathParam,
      requestTitleDescriptionDto,
    );
  }

  @Get('/notice/:lectureId')
  getNotices(@Param() pathParam: RequestLectureIdDto) {
    return this.lecturesService.getNotices(pathParam);
  }

  @Delete('/admin/notice/:lectureId')
  @UseGuards(AdminUserGuard)
  deleteNotice(
    @Param() pathParam: RequestLectureIdDto,
    @Query() queryParam: RequestNoticeIdDto,
  ) {
    return this.lecturesService.deleteNotice(pathParam, queryParam);
  }

  @Put('/admin/notice/modify/:lectureId')
  @UseGuards(AdminUserGuard)
  updateNotice(
    @Param() pathParam: RequestLectureIdDto,
    @Query() queryParam: RequestNoticeIdDto,
    @Body() requestTitleDescriptionDto: RequestTitleDescriptionDto,
  ) {
    return this.lecturesService.updateNotice(
      pathParam,
      queryParam,
      requestTitleDescriptionDto,
    );
  }

  @Post('/question/:lectureId')
  @UseGuards(StudentUserGuard)
  createQuestion(
    @Param() pathParam: RequestLectureIdDto,
    @GetUser() user: User,
    @Body() requestTitleDescriptionDto: RequestTitleDescriptionDto,
  ) {
    return this.lecturesService.createQuestion(
      pathParam,
      user,
      requestTitleDescriptionDto,
    );
  }

  @Delete('/question/:lectureId')
  @UseGuards(JwtAuthGuard)
  deleteQuestion(
    @Param() pathParam: RequestLectureIdDto,
    @GetUser() user: User,
    @Query() queryParam: RequestQuestionIdDto,
  ) {
    return this.lecturesService.deleteQuestion(pathParam, user, queryParam);
  }

  @Put('/question/modify/:lectureId')
  @UseGuards(JwtAuthGuard)
  updateQuestion(
    @Param() pathParam: RequestLectureIdDto,
    @GetUser() user: User,
    @Query() queryParam: RequestQuestionIdDto,
    @Body() requestTitleDescriptionDto: RequestTitleDescriptionDto,
  ) {
    return this.lecturesService.updateQuestion(
      pathParam,
      user,
      queryParam,
      requestTitleDescriptionDto,
    );
  }

  @Post('/admin/answer')
  @UseGuards(AdminUserGuard)
  createAnswer(@Body() requestCreateAnswerDto: RequestCreateAnswerDto) {
    return this.lecturesService.createAnswer(requestCreateAnswerDto);
  }

  @Delete('/admin/answer/:answer_id')
  @UseGuards(AdminUserGuard)
  deleteAnswer(@Param() pathParam: RequestAnswerIdDto) {
    return this.lecturesService.deleteAnswer(pathParam);
  }

  @Put('/admin/answer/modify/:question_id')
  @UseGuards(AdminUserGuard)
  updateAnswer(
    @Param() pathParam: RequestQuestionIdDto,
    @Query() queryParam: RequestAnswerIdDto,
    @Body() requestTitleDescriptionDto: RequestTitleDescriptionDto,
  ) {
    return this.lecturesService.updateAnswer(
      pathParam,
      queryParam,
      requestTitleDescriptionDto,
    );
  }
}
