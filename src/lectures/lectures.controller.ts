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
} from '@nestjs/common';
import { JwtAuthGuard } from '../users/guard/jwt.guard';
import { RequestCreateLectureDto } from './dto/request/request-create-lecture.dto';
import { ResponseCreateLectureDto } from './dto/response/responseCreateLecture.dto';
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

@Controller('lecture')
export class LecturesController {
  constructor(private readonly lecturesService: LecturesService) {}

  @Post('/create')
  @UseGuards(AdminUserGuard)
  createLecture(
    @Body() requestCreateLectureDto: RequestCreateLectureDto,
  ): Promise<ResponseCreateLectureDto | string> {
    return this.lecturesService.createLecture(requestCreateLectureDto);
  }

  @Put('/admin/:lectureId')
  @UseGuards(AdminUserGuard)
  updateLectureInfo(
    @Param() pathParam: RequestLectureIdDto,
    @Body()
    requestUpdateLectureInfoDto: RequestUpdateLectureInfoDto,
  ) {
    return this.lecturesService.updateLectureInfo(
      pathParam,
      requestUpdateLectureInfoDto,
    );
  }

  @Delete('/admin/:lectureId')
  @UseGuards(AdminUserGuard)
  deleteLecture(@Param() pathParam: RequestLectureIdDto) {
    return this.lecturesService.deleteLecture(pathParam);
  }

  @Get('/all')
  readAllLectures() {
    return this.lecturesService.readAllLectures();
  }

  @Get('/guest/:lectureId')
  readLectureByIdGuest(@Param() pathParam: RequestLectureIdDto) {
    return this.lecturesService.readLectureByIdGuest(pathParam);
  }

  @Get('/:lectureId')
  @UseGuards(JwtAuthGuard)
  readLectureById(
    @GetUser() user: User,
    @Param() pathParam: RequestLectureIdDto,
  ) {
    return this.lecturesService.readLectureById(user, pathParam);
  }

  @Get('/video/:lectureId')
  @UseGuards(JwtAuthGuard)
  readLectureVideoById(
    @GetUser() user: User,
    @Param() pathParam: RequestLectureIdDto,
  ) {
    return this.lecturesService.readLectureVideoById(user, pathParam);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  readLectures(@GetUser() user: User) {
    return this.lecturesService.readLectures(user);
  }

  @Get('/admin/status')
  @UseGuards(AdminUserGuard)
  readLectureStatuses() {
    return this.lecturesService.readLectureStatuses();
  }

  @Put('/:lectureId')
  @UseGuards(StudentUserGuard)
  registerLecture(
    @Param() pathParam: RequestLectureIdDto,
    @GetUser() user: User,
  ) {
    return this.lecturesService.registerLecture(pathParam, user);
  }

  @Put('/admin/status/:lectureId')
  @UseGuards(AdminUserGuard)
  updateLectureStatus(
    @Param() pathParam: RequestLectureIdDto,
    @Query() queryParam: RequestUserIdDto,
    @Body() requestUpdateLectureStatus: RequestUpdateLectureStatusDto,
  ) {
    return this.lecturesService.updateLectureStatus(
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
  readAllTags() {
    return this.lecturesService.readAllTags();
  }

  @Get('/tag/:lectureId')
  readTags(@Param() pathParam: RequestLectureIdDto) {
    return this.lecturesService.readTags(pathParam);
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
  registerTag(
    @Param() pathParam: RequestLectureIdDto,
    @Body() requestRegisterTagDto: RequestRegisterTagDto,
  ) {
    return this.lecturesService.registerTag(pathParam, requestRegisterTagDto);
  }

  @Delete('/admin/tag/unregister/:lectureId')
  @UseGuards(AdminUserGuard)
  unregisterTag(
    @Param() pathParam: RequestLectureIdDto,
    @Query() queryParam: RequestTagIdDto,
  ) {
    return this.lecturesService.unregisterTag(pathParam, queryParam);
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
      user,
      requestTitleDescriptionDto,
    );
  }

  @Get('/notice/:lectureId')
  readNotices(@Param() pathParam: RequestLectureIdDto) {
    return this.lecturesService.readNotices(pathParam);
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
