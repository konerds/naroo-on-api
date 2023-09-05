import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import _ = require('lodash');
import { JwtService } from '@nestjs/jwt';
import { LectureTag } from './entity/lecture-tag.entity';
import { Question } from './entity/question.entity';
import {
  CONST_LECTURE_STATUS,
  StudentLecture,
} from './entity/student-lecture.entity';
import { Tag } from './entity/tag.entity';
import { RequestCreateLectureDto } from './dto/request/request-create-lecture.dto';
import { CONST_ROLE_TYPE, User } from '../users/entity/user.entity';
import { LectureNotice } from './entity/lecture-notice.entity';
import { RequestUpdateLectureInfoDto } from './dto/request/request-update-lecture-info.dto';
import { RequestLectureIdDto } from './dto/request/request-lecture-id.dto';
import { RequestUserIdDto } from './dto/request/request-user-id.dto';
import { RequestUpdateLectureStatusDto } from './dto/request/request-update-lecture-status.dto';
import { RequestTagNameDto } from './dto/request/request-tag-name.dto';
import { RequestTagIdDto } from './dto/request/request-tag-id.dto';
import { RequestRegisterTagDto } from './dto/request/request-register-tag.dto';
import { RequestTitleDescriptionDto } from './dto/request/request-title-description.dto';
import { RequestCreateAnswerDto } from './dto/request/request-create-answer.dto';
import { Answer } from './entity/answer.entity';
import { RequestAnswerIdDto } from './dto/request/request-answer-id.dto';
import { RequestNoticeIdDto } from './dto/request/request-notice-id.dto';
import { RequestQuestionIdDto } from './dto/request/request-question-id.dto';
import { Lecture } from './entity/lecture.entity';

@Injectable()
export class LecturesService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Lecture)
    private readonly lecturesRepository: Repository<Lecture>,
    @InjectRepository(LectureTag)
    private readonly lectureTagsRepository: Repository<LectureTag>,
    @InjectRepository(LectureNotice)
    private readonly lectureNoticesRepository: Repository<LectureNotice>,
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
    @InjectRepository(Answer)
    private readonly answersRepository: Repository<Answer>,
    @InjectRepository(StudentLecture)
    private readonly studentLecturesRepository: Repository<StudentLecture>,
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createLecture(requestCreateLectureDto: RequestCreateLectureDto) {
    try {
      await this.lecturesRepository.save({
        title: requestCreateLectureDto.title,
        description: requestCreateLectureDto.description,
        thumbnail: requestCreateLectureDto.thumbnail,
        images: requestCreateLectureDto.images,
        expiredAt: requestCreateLectureDto.expiredAt,
        teacherName: requestCreateLectureDto.teacherName,
        videoUrl: requestCreateLectureDto.videoUrl,
        videoTitle: requestCreateLectureDto.videoTitle,
      });
      return { message: '강의가 성공적으로 등록되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async updateLectureInfo(
    param: RequestLectureIdDto,
    requestUpdateLectureInfoDto: RequestUpdateLectureInfoDto,
  ) {
    try {
      const lectureExisted = await this.lecturesRepository.findOne({
        where: {
          id: +param.lectureId,
        },
      });
      lectureExisted.thumbnail =
        requestUpdateLectureInfoDto.thumbnail || lectureExisted.thumbnail;
      lectureExisted.expiredAt =
        requestUpdateLectureInfoDto.expired || lectureExisted.expiredAt;
      lectureExisted.title =
        requestUpdateLectureInfoDto.title || lectureExisted.title;
      lectureExisted.description =
        requestUpdateLectureInfoDto.description || lectureExisted.description;
      lectureExisted.teacherName =
        requestUpdateLectureInfoDto.teacherName || lectureExisted.teacherName;
      if (
        requestUpdateLectureInfoDto.img_description &&
        requestUpdateLectureInfoDto.img_description_index
      ) {
        lectureExisted.images[
          +requestUpdateLectureInfoDto.img_description_index
        ] = requestUpdateLectureInfoDto.img_description;
      }
      lectureExisted.videoTitle =
        requestUpdateLectureInfoDto.video_title || lectureExisted.videoTitle;
      lectureExisted.videoUrl =
        requestUpdateLectureInfoDto.video_url || lectureExisted.videoUrl;
      await this.lecturesRepository.save(lectureExisted);
      return { message: '강의가 성공적으로 업데이트되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async deleteLecture(param: RequestLectureIdDto) {
    try {
      const isExistLectureDeleting = await this.lecturesRepository.exist({
        where: {
          id: +param.lectureId,
        },
      });
      if (!isExistLectureDeleting) {
        throw new HttpException(
          '존재하지 않는 강의입니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      const result = await this.lecturesRepository.softDelete({
        id: +param.lectureId,
      });
      if (!(!!result && result.affected === 1)) {
        throw new HttpException(
          '강의 삭제에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '강의가 성공적으로 삭제되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async getAllLectures() {
    try {
      const listLectureAll = await this.lecturesRepository
        .createQueryBuilder('lecture')
        .select([
          'lecture.id AS id',
          'lecture.title AS title',
          'lecture.images AS images',
          'lecture.description AS description',
          'lecture.thumbnail AS thumbnail',
          'lecture.teacherName AS teacher_nickname',
          'lecture.expiredAt AS expired',
          'lecture.videoUrl AS video_url',
          'lecture.videoTitle AS video_title',
        ])
        .addSelect((sq) => {
          return sq
            .select([
              `json_agg(json_build_object('id', tag.id, 'name', tag.name)) AS tags`,
            ])
            .from(LectureTag, 'lecture_tag')
            .innerJoin('lecture_tag.lecture', 'lecture_joined')
            .innerJoin('lecture_tag.tag', 'tag')
            .having('lecture_joined.id = lecture.id')
            .groupBy('lecture_joined.id')
            .addGroupBy('tag.name')
            .orderBy('tag.name', 'ASC');
        })
        .groupBy('lecture.id')
        .orderBy('lecture.id', 'DESC')
        .getRawMany();
      return listLectureAll;
    } catch (e) {
      throw e;
    }
  }

  async getLectureByIdForGuest(pathParam: RequestLectureIdDto) {
    try {
      const lectureByIdForGuest = await this.lecturesRepository
        .createQueryBuilder('lecture')
        .select([
          'lecture.id AS id',
          'lecture.title AS title',
          'lecture.description AS description',
          'lecture.thumbnail AS thumbnail',
          'lecture.images AS images',
          'lecture.teacherName AS teacher_nickname',
          'lecture.expiredAt AS expired',
          'lecture.videoUrl AS video_url',
          'lecture.videoTitle AS video_title',
        ])
        .addSelect((sq) => {
          return sq
            .select([
              `json_agg(json_build_object('id', tag.id, 'name', tag.name)) AS tags`,
            ])
            .from(LectureTag, 'lecture_tag')
            .innerJoin('lecture_tag.lecture', 'lecture_joined')
            .innerJoin('lecture_tag.tag', 'tag')
            .having('lecture_joined.id = lecture.id')
            .groupBy('lecture_joined.id')
            .addGroupBy('tag.name')
            .orderBy('tag.name', 'ASC');
        })
        .addSelect((sq) => {
          return sq
            .select([
              `json_agg(json_build_object('id', lecture_notice.id, 'createdAt', lecture_notice.createdAt, 'title', lecture_notice.title, 'description', lecture_notice.description)) AS notices`,
            ])
            .from(LectureNotice, 'lecture_notice')
            .innerJoin('lecture_notice.lecture', 'lecture')
            .having('lecture.id = :lectureId', {
              lectureId: +pathParam.lectureId,
            })
            .groupBy('lecture.id')
            .addGroupBy('lecture_notice.id')
            .orderBy('lecture_notice.id', 'DESC');
        })
        .addSelect((sq) => {
          return sq
            .select(['COUNT(student_lecture.lectureId)'])
            .from(StudentLecture, 'student_lecture')
            .innerJoin('student_lecture.lecture', 'apply_lecture')
            .groupBy('apply_lecture.id')
            .addGroupBy('student_lecture.status')
            .having('apply_lecture.id = :lectureId', {
              lectureId: +pathParam.lectureId,
            })
            .andHaving('student_lecture.status = :status', {
              status: CONST_LECTURE_STATUS.ACCEPT,
            });
        })
        .where('lecture.id = :lectureId', { lectureId: +pathParam.lectureId })
        .orderBy('lecture.id', 'DESC')
        .groupBy('lecture.id')
        .getRawOne();
      return lectureByIdForGuest;
    } catch (e) {
      throw e;
    }
  }

  async getLectureById(user: User, pathParam: RequestLectureIdDto) {
    try {
      const student = await this.studentLecturesRepository
        .createQueryBuilder('student_lecture')
        .innerJoin('student_lecture.user', 'apply_student')
        .innerJoin('student_lecture.lecture', 'apply_lecture')
        .where('apply_student.id = :studentId', { studentId: +user.id })
        .andWhere('apply_lecture.id = :lectureId', {
          lectureId: +pathParam.lectureId,
        })
        .select(['student_lecture.status AS status'])
        .getRawOne();
      const lecture = await this.lecturesRepository
        .createQueryBuilder('lecture')
        .where('lecture.id = :lectureId', { lectureId: +pathParam.lectureId })
        .select([
          'lecture.id AS id',
          'lecture.title AS title',
          'lecture.description AS description',
          'lecture.thumbnail AS thumbnail',
          'lecture.images AS images',
          'lecture.teacherName AS teacher_nickname',
          'lecture.expiredAt AS expired',
          'lecture.videoTitle AS video_title',
          'lecture.videoUrl AS video_url',
        ])
        .getRawOne();
      const currentTimestamp = new Date().toISOString();
      const expiredTimestamp = new Date(lecture.expired).toISOString();
      const status =
        expiredTimestamp < currentTimestamp
          ? 'expired'
          : !student || !student.status
          ? null
          : student.status;
      const notices = await this.lectureNoticesRepository
        .createQueryBuilder('lecture_notice')
        .innerJoin('lecture_notice.lecture', 'lecture')
        .where('lecture.id = :lectureId', {
          lectureId: lecture.id,
        })
        .select([
          'lecture_notice.id AS id',
          'lecture_notice.createdAt AS created_at',
          'lecture_notice.title AS title',
          'lecture_notice.description AS description',
        ])
        .orderBy('lecture_notice.id', 'DESC')
        .getRawMany();
      const tags = await this.lectureTagsRepository
        .createQueryBuilder('lecture_tag')
        .innerJoin('lecture_tag.lecture', 'lecture')
        .innerJoin('lecture_tag.tag', 'tag')
        .where('lecture.id = :lectureId', { lectureId: lecture.id })
        .select(['tag.id AS id', 'tag.name AS name'])
        .orderBy('tag.name', 'DESC')
        .getRawMany();
      const users = await this.studentLecturesRepository
        .createQueryBuilder('student_lecture')
        .innerJoin('student_lecture.user', 'apply_student')
        .innerJoin('student_lecture.lecture', 'apply_lecture')
        .where('apply_lecture.id = :lectureId', {
          lectureId: +pathParam.lectureId,
        })
        .andWhere('student_lecture.status = :status', {
          status: CONST_LECTURE_STATUS.ACCEPT,
        })
        .getCount();
      const qnas =
        user.role === CONST_ROLE_TYPE.ADMIN
          ? await this.questionsRepository
              .createQueryBuilder('question')
              .innerJoin('question.lecture', 'lecture')
              .innerJoin('question.student', 'student')
              .leftJoin('question.answer', 'answer')
              .where('lecture.id = :lectureId', {
                lectureId: +pathParam.lectureId,
              })
              .select([
                'question.id AS question_id',
                'answer.id AS answer_id',
                'student.id AS creator_id',
                'student.nickname AS creator_nickname',
                'question.createdAt AS question_created_at',
                'question.title AS question_title',
                'question.description AS question_description',
                'answer.createdAt AS answer_created_at',
                'answer.title AS answer_title',
                'answer.description AS answer_description',
              ])
              .orderBy('question.createdAt', 'DESC')
              .getRawMany()
          : await this.questionsRepository
              .createQueryBuilder('question')
              .innerJoin('question.lecture', 'lecture')
              .innerJoin('question.student', 'student')
              .leftJoin('question.answer', 'answer')
              .where('lecture.id = :lectureId', {
                lectureId: +pathParam.lectureId,
              })
              .andWhere('student.id = :studentId', { studentId: +user.id })
              .select([
                'question.id AS question_id',
                'answer.id AS answer_id',
                'student.id AS creator_id',
                'student.nickname AS creator_nickname',
                'question.createdAt AS question_created_at',
                'question.title AS question_title',
                'question.description AS question_description',
                'answer.createdAt AS answer_created_at',
                'answer.title AS answer_title',
                'answer.description AS answer_description',
              ])
              .orderBy('question.createdAt', 'DESC')
              .getRawMany();
      return {
        id: lecture.id,
        title: lecture.title,
        description: lecture.description,
        thumbnail: lecture.thumbnail,
        images: lecture.images,
        teacher_nickname: lecture.teacher_nickname,
        status,
        expired: lecture.expired,
        video_title: lecture.video_title,
        video_url: lecture.video_url,
        notices,
        tags,
        users,
        qnas,
      };
    } catch (e) {
      throw e;
    }
  }

  async getLectureVideoById(user: User, pathParam: RequestLectureIdDto) {
    try {
      const student = await this.studentLecturesRepository
        .createQueryBuilder('student_lecture')
        .innerJoin('student_lecture.user', 'apply_student')
        .innerJoin('student_lecture.lecture', 'apply_lecture')
        .where('apply_student.id = :studentId', { studentId: +user.id })
        .andWhere('apply_lecture.id = :lectureId', {
          lectureId: +pathParam.lectureId,
        })
        .select(['student_lecture.status AS status'])
        .getRawOne();
      const lecture = await this.lecturesRepository
        .createQueryBuilder('lecture')
        .where('lecture.id = :lectureId', { lectureId: +pathParam.lectureId })
        .select([
          'lecture.id AS id',
          'lecture.title AS title',
          'lecture.description AS description',
          'lecture.thumbnail AS thumbnail',
          'lecture.images AS images',
          'lecture.teacherName AS teacher_nickname',
          'lecture.expiredAt AS expired',
          'lecture.videoTitle AS video_title',
          'lecture.videoUrl AS video_url',
        ])
        .getRawOne();
      const currentTimestamp = new Date().toISOString();
      const expiredTimestamp = new Date(lecture.expired).toISOString();
      const status =
        !student || !student.status
          ? null
          : expiredTimestamp < currentTimestamp
          ? 'expired'
          : student.status;
      const tags = await this.lectureTagsRepository
        .createQueryBuilder('lecture_tag')
        .innerJoin('lecture_tag.lecture', 'lecture')
        .innerJoin('lecture_tag.tag', 'tag')
        .where('lecture.id = :lectureId', { lectureId: lecture.id })
        .select(['tag.id AS id', 'tag.name AS name'])
        .orderBy('tag.name', 'DESC')
        .getRawMany();
      const users = await this.studentLecturesRepository
        .createQueryBuilder('student_lecture')
        .innerJoin('student_lecture.user', 'apply_student')
        .innerJoin('student_lecture.lecture', 'apply_lecture')
        .where('apply_lecture.id = :lectureId', {
          lectureId: +pathParam.lectureId,
        })
        .andWhere('student_lecture.status = :status', {
          status: CONST_LECTURE_STATUS.ACCEPT,
        })
        .getCount();
      return {
        id: lecture.id,
        title: lecture.title,
        description: lecture.description,
        thumbnail: lecture.thumbnail,
        images: lecture.images,
        teacher_nickname: lecture.teacher_nickname,
        status,
        expired: lecture.expired,
        video_title: lecture.video_title,
        video_url: lecture.video_url,
        tags,
        users,
      };
    } catch (e) {
      throw e;
    }
  }

  async getLectures(user: User) {
    try {
      const lectureOnStatuses = await this.studentLecturesRepository
        .createQueryBuilder('student_lecture')
        .innerJoin('student_lecture.user', 'apply_student')
        .innerJoin('student_lecture.lecture', 'apply_lecture')
        .where('apply_student.id = :studentId', { studentId: +user.id })
        .andWhere('student_lecture.status IN (:...statuses)', {
          statuses: [CONST_LECTURE_STATUS.APPLY, CONST_LECTURE_STATUS.ACCEPT],
        })
        .select([
          'apply_lecture.id AS id',
          'apply_lecture.title AS title',
          'apply_lecture.thumbnail AS thumbnail',
          'apply_lecture.teacherName AS teacher_nickname',
          'student_lecture.status AS status',
          'apply_lecture.expiredAt AS expired',
        ])
        .orderBy('apply_lecture.title', 'DESC')
        .getRawMany();
      const responseApprovedLectures = [];
      await lectureOnStatuses.reduce(async (prevPromise, lecture) => {
        await prevPromise.then();
        const tags = await this.lectureTagsRepository
          .createQueryBuilder('lecture_tag')
          .innerJoin('lecture_tag.lecture', 'lecture')
          .innerJoin('lecture_tag.tag', 'tag')
          .where('lecture.id = :lectureId', { lectureId: lecture.id })
          .select(['tag.id AS id', 'tag.name AS name'])
          .orderBy('tag.name', 'DESC')
          .getRawMany();
        const currentTimestamp = new Date().toISOString();
        const expiredTimestamp = new Date(lecture.expired).toISOString();
        const status = !lecture.status
          ? null
          : expiredTimestamp < currentTimestamp
          ? 'expired'
          : lecture.status;
        responseApprovedLectures.push({
          id: lecture.id,
          title: lecture.title,
          thumbnail: lecture.thumbnail,
          teacher_nickname: lecture.teacher_nickname,
          status,
          expired: lecture.expired,
          tags,
        });
      }, Promise.resolve());
      return responseApprovedLectures;
    } catch (e) {
      throw e;
    }
  }

  async getStatusLectures() {
    try {
      const allStudents = await this.usersRepository
        .createQueryBuilder('user')
        .where('user.role != :userRole', { userRole: 'admin' })
        .select([
          'user.id AS id',
          'user.nickname AS nickname',
          'user.email AS email',
        ])
        .orderBy('user.id', 'DESC')
        .getRawMany();

      const allLectures = await this.lecturesRepository
        .createQueryBuilder('lecture')
        .select([
          'lecture.id AS id',
          'lecture.title AS title',
          'lecture.thumbnail AS thumbnail',
          'lecture.teacherName AS teacher_nickname',
          'lecture.expiredAt AS expired',
        ])
        .orderBy('lecture.id', 'DESC')
        .getRawMany();

      const allLectureStatuses = await this.studentLecturesRepository
        .createQueryBuilder('student_lecture')
        .leftJoin('student_lecture.user', 'apply_student')
        .leftJoin('student_lecture.lecture', 'apply_lecture')
        .select([
          'apply_student.id AS student_id',
          'apply_lecture.id AS lecture_id',
          'apply_lecture.title AS title',
          'apply_lecture.thumbnail AS thumbnail',
          'apply_lecture.teacherName AS teacher_nickname',
          'student_lecture.status AS status',
          'apply_lecture.expiredAt AS expired',
        ])
        .orderBy('apply_lecture.title', 'DESC')
        .getRawMany();

      const filteredStatuses: {
        student_id: string;
        student_email: string;
        student_nickname: string;
        lecture_id: string;
        title: string;
        thumbnail: string;
        teacher_nickname: string;
        status: string | null;
        expired: string | null;
      }[] = [];
      for (const student of allStudents) {
        if (!!student) {
          for (const lecture of allLectures) {
            if (!!lecture) {
              filteredStatuses.push({
                student_id: student.id,
                student_email: student.email,
                student_nickname: student.nickname,
                lecture_id: lecture.id,
                title: lecture.title,
                thumbnail: lecture.thumbnail,
                teacher_nickname: lecture.teacher_nickname,
                status: null,
                expired: lecture.expired,
              });
            }
          }
        }
      }
      for (const statusNullResult of filteredStatuses) {
        if (!!allLectureStatuses) {
          for (const allLectureStatus of allLectureStatuses) {
            if (
              allLectureStatus.student_id === statusNullResult.student_id &&
              allLectureStatus.lecture_id === statusNullResult.lecture_id
            ) {
              statusNullResult.status = allLectureStatus.status;
            }
          }
        }
      }
      return filteredStatuses;
    } catch (e) {
      throw e;
    }
  }

  async connectUserWithLecture(pathParam: RequestLectureIdDto, user: User) {
    try {
      await this.studentLecturesRepository.save({
        user: { id: user.id },
        lecture: { id: +pathParam.lectureId },
        status: CONST_LECTURE_STATUS.APPLY,
      });
      return { message: '강의 신청이 완료되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async updateStatusLecture(
    pathParam: RequestLectureIdDto,
    queryParam: RequestUserIdDto,
    requestUpdateLectureStatus: RequestUpdateLectureStatusDto,
  ) {
    try {
      await this.studentLecturesRepository.save({
        user: { id: +queryParam.user_id },
        lecture: { id: +pathParam.lectureId },
        status: requestUpdateLectureStatus.status,
      });
      return { message: '성공적으로 강의 상태가 업데이트되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async createTag(requestTagNameDto: RequestTagNameDto) {
    try {
      await this.tagsRepository.save({
        name: requestTagNameDto.name,
      });
      return { message: '성공적으로 태그가 등록되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async getAllTags() {
    try {
      return await this.tagsRepository
        .createQueryBuilder('tag')
        .select(['tag.id AS id', 'tag.name AS name'])
        .orderBy('tag.name', 'DESC')
        .getRawMany();
    } catch (e) {
      throw e;
    }
  }

  async getTags(pathParam: RequestLectureIdDto) {
    try {
      return await this.lectureTagsRepository
        .createQueryBuilder('lecture_tag')
        .innerJoin('lecture_tag.tag', 'tag')
        .innerJoin('lecture_tag.lecture', 'lecture')
        .where('lecture.id = :id', { id: +pathParam.lectureId })
        .select(['tag.id AS id', 'tag.name AS name'])
        .orderBy('tag.name', 'DESC')
        .getRawMany();
    } catch (e) {
      throw e;
    }
  }

  async updateTag(
    pathParam: RequestTagIdDto,
    requestTagNameDto: RequestTagNameDto,
  ) {
    try {
      const tagUpdating = await this.tagsRepository.findOne({
        where: {
          id: +pathParam.tag_id,
        },
      });
      if (!!!tagUpdating) {
        throw new HttpException(
          '존재하지 않는 태그입니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      tagUpdating.name = requestTagNameDto.name;
      await this.tagsRepository.save(tagUpdating);
      return { message: '성공적으로 태그가 업데이트되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async deleteTag(pathParam: RequestTagIdDto) {
    try {
      const isExistTag = await this.tagsRepository.exist({
        where: {
          id: +pathParam.tag_id,
        },
      });
      if (!isExistTag) {
        throw new HttpException(
          '존재하지 않는 태그입니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      const result = await this.tagsRepository.softDelete({
        id: +pathParam.tag_id,
      });
      if (!(!!result && result.affected === 1)) {
        throw new HttpException(
          '태그 삭제에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '성공적으로 태그가 삭제되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async connectTagToLecture(
    pathParam: RequestLectureIdDto,
    requestRegisterTagDto: RequestRegisterTagDto,
  ) {
    try {
      if (requestRegisterTagDto.ids.length <= 0) {
        throw new HttpException('잘못된 요청입니다', HttpStatus.BAD_REQUEST);
      }
      const ids = Array.isArray(requestRegisterTagDto.ids)
        ? requestRegisterTagDto.ids
        : [requestRegisterTagDto.ids];
      const listTagExist = await this.lectureTagsRepository
        .createQueryBuilder('lecture_tag')
        .innerJoin('lecture_tag.lecture', 'lecture')
        .innerJoin('lecture_tag.tag', 'tag')
        .where('lecture.id = :lectureId', { lectureId: pathParam.lectureId })
        .select(['tag.id AS id'])
        .orderBy('tag.id', 'DESC')
        .getRawMany();
      await listTagExist.reduce(async (prevPromise, existTag) => {
        await prevPromise.then();
        const result = await this.lectureTagsRepository.delete({
          lecture: { id: +pathParam.lectureId },
          tag: { id: existTag.id },
        });
        if (!(result && result.affected === 1)) {
          throw new HttpException(
            '이미 등록된 태그 삭제에 실패하였습니다',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }, Promise.resolve());
      await ids.reduce(async (prevPromise, id) => {
        await prevPromise.then();
        const result = await this.lectureTagsRepository.save({
          lecture: { id: +pathParam.lectureId },
          tag: { id: +id },
        });
        if (!result) {
          throw new HttpException(
            '태그를 강의에 등록하는 중 오류가 발생하였습니다',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }, Promise.resolve());
      return { message: '태그가 성공적으로 강의에 등록되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async disconnectTagFromLecture(
    pathParam: RequestLectureIdDto,
    queryParam: RequestTagIdDto,
  ) {
    try {
      const tagExist = await this.lectureTagsRepository
        .createQueryBuilder('lecture_tag')
        .innerJoin('lecture_tag.lecture', 'lecture')
        .innerJoin('lecture_tag.tag', 'tag')
        .where('lecture.id = :lectureId', { lectureId: pathParam.lectureId })
        .andWhere('tag.id = :tagId', { tagId: queryParam.tag_id })
        .select(['lecture.id AS lecture_id', 'tag.id AS tag_id'])
        .getRawOne();
      if (!!!tagExist) {
        throw new HttpException(
          '존재하지 않는 태그입니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await this.lectureTagsRepository.delete({
        lecture: { id: tagExist.lecture_id },
        tag: { id: tagExist.tag_id },
      });
      if (!(!!result && result.affected === 1)) {
        throw new HttpException(
          '등록된 태그를 해제할 수 없습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '태그가 성공적으로 강의에서 해제되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async createNotice(
    pathParam: RequestLectureIdDto,
    requestTitleDescriptionDto: RequestTitleDescriptionDto,
  ) {
    try {
      await this.lectureNoticesRepository.save({
        lecture: { id: +pathParam.lectureId },
        title: requestTitleDescriptionDto.title,
        description: requestTitleDescriptionDto.description,
      });
      return { message: '성공적으로 공지사항이 등록되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async getNotices(pathParam: RequestLectureIdDto) {
    try {
      return await this.lectureNoticesRepository
        .createQueryBuilder('lecture_notice')
        .innerJoin('lecture_notice.lecture', 'lecture')
        .where('lecture.id = :lectureId', {
          lectureId: +pathParam.lectureId,
        })
        .select([
          'lecture_notice.id AS id',
          'lecture_notice.createdAt AS created_at',
          'lecture_notice.title AS title',
          'lecture_notice.description AS description',
        ])
        .orderBy('lecture_notice.createdAt', 'DESC')
        .getRawMany();
    } catch (e) {
      throw e;
    }
  }

  async deleteNotice(
    pathParam: RequestLectureIdDto,
    queryParam: RequestNoticeIdDto,
  ) {
    try {
      const isExistNotice = await this.lectureNoticesRepository.exist({
        where: {
          lecture: { id: +pathParam.lectureId },
          id: +queryParam.notice_id,
        },
      });
      if (!isExistNotice) {
        throw new HttpException(
          '존재하지 않는 공지사항입니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await this.lectureNoticesRepository.softDelete({
        lecture: { id: +pathParam.lectureId },
        id: +queryParam.notice_id,
      });
      if (!(!!result && result.affected === 1)) {
        throw new HttpException(
          '공지사항 삭제에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '성공적으로 공지사항이 삭제되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async updateNotice(
    pathParam: RequestLectureIdDto,
    queryParam: RequestNoticeIdDto,
    requestTitleDescriptionDto: RequestTitleDescriptionDto,
  ) {
    try {
      const noticeUpdating = await this.lectureNoticesRepository.findOne({
        where: {
          lecture: { id: +pathParam.lectureId },
          id: +queryParam.notice_id,
        },
      });
      if (!!!noticeUpdating) {
        throw new HttpException(
          '존재하지 않는 공지사항입니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.lectureNoticesRepository.save({
        id: +queryParam.notice_id,
        lecture: { id: +pathParam.lectureId },
        title: requestTitleDescriptionDto.title,
        description: requestTitleDescriptionDto.description,
      });
      return { message: '성공적으로 공지사항이 업데이트되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async createQuestion(
    pathParam: RequestLectureIdDto,
    user: User,
    requestTitleDescriptionDto: RequestTitleDescriptionDto,
  ) {
    try {
      await this.questionsRepository.save({
        lecture: { id: +pathParam.lectureId },
        student: { id: +user.id },
        title: requestTitleDescriptionDto.title,
        description: requestTitleDescriptionDto.description,
      });
      return { message: '성공적으로 문의가 등록되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async deleteQuestion(
    pathParam: RequestLectureIdDto,
    user: User,
    queryParam: RequestQuestionIdDto,
  ) {
    try {
      const questionDeleting = await this.questionsRepository.findOne({
        where: {
          lecture: { id: +pathParam.lectureId },
          id: +queryParam.question_id,
        },
      });
      if (
        typeof user.role === typeof CONST_ROLE_TYPE &&
        user.role !== CONST_ROLE_TYPE.ADMIN
      ) {
        if (
          user.role === CONST_ROLE_TYPE.STUDENT &&
          questionDeleting.student.id !== user.id
        ) {
          throw new HttpException(
            '해당 요청은 문의를 등록한 학생 본인만 가능합니다',
            HttpStatus.FORBIDDEN,
          );
        }
      }
      if (!!!questionDeleting) {
        throw new HttpException(
          '존재하지 않는 문의입니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await this.questionsRepository.softDelete({
        lecture: { id: +pathParam.lectureId },
        id: +queryParam.question_id,
      });
      if (!(!!result && result.affected === 1)) {
        throw new HttpException(
          '문의 삭제에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '성공적으로 문의가 삭제되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async updateQuestion(
    pathParam: RequestLectureIdDto,
    user: User,
    queryParam: RequestQuestionIdDto,
    requestTitleDescriptionDto: RequestTitleDescriptionDto,
  ) {
    try {
      const questionUpdating = await this.questionsRepository.findOne({
        where: {
          lecture: { id: +pathParam.lectureId },
          id: +queryParam.question_id,
        },
      });
      if (
        typeof user.role === typeof CONST_ROLE_TYPE &&
        user.role !== CONST_ROLE_TYPE.ADMIN
      ) {
        if (
          user.role === CONST_ROLE_TYPE.STUDENT &&
          questionUpdating.student.id !== user.id
        ) {
          throw new HttpException(
            '해당 요청은 문의를 작성한 학생 본인만 가능합니다',
            HttpStatus.FORBIDDEN,
          );
        }
      }
      if (!!!questionUpdating) {
        throw new HttpException(
          '존재하지 않는 문의입니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.questionsRepository.save({
        id: +queryParam.question_id,
        lecture: { id: +pathParam.lectureId },
        title: requestTitleDescriptionDto.title,
        description: requestTitleDescriptionDto.description,
      });
      return { message: '성공적으로 문의가 업데이트되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async createAnswer(requestCreateAnswerDto: RequestCreateAnswerDto) {
    try {
      await this.answersRepository.save({
        question: { id: +requestCreateAnswerDto.question_id },
        title: requestCreateAnswerDto.title,
        description: requestCreateAnswerDto.description,
      });
      return { message: '성공적으로 답변이 등록되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async deleteAnswer(pathParam: RequestAnswerIdDto) {
    try {
      const isExistAnswer = await this.answersRepository.exist({
        where: {
          id: +pathParam.answer_id,
        },
      });
      if (!isExistAnswer) {
        throw new HttpException(
          '존재하지 않는 답변입니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await this.answersRepository.softDelete({
        id: +pathParam.answer_id,
      });
      if (!(!!result && result.affected === 1)) {
        throw new HttpException(
          '답변 삭제에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '성공적으로 답변이 삭제되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async updateAnswer(
    pathParam: RequestQuestionIdDto,
    queryParam: RequestAnswerIdDto,
    requestTitleDescriptionDto: RequestTitleDescriptionDto,
  ) {
    try {
      const answerUpdating = await this.answersRepository.findOne({
        where: {
          question: { id: +pathParam.question_id },
          id: +queryParam.answer_id,
        },
      });
      if (!!!answerUpdating) {
        throw new HttpException(
          '존재하지 않는 답변입니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.answersRepository.save({
        id: +queryParam.answer_id,
        question: { id: +pathParam.question_id },
        title: requestTitleDescriptionDto.title,
        description: requestTitleDescriptionDto.description,
      });
      return { message: '성공적으로 답변이 업데이트되었습니다' };
    } catch (e) {
      throw e;
    }
  }
}
