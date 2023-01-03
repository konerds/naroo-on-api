import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      const result = await this.lecturesRepository.save({
        title: requestCreateLectureDto.title,
        description: requestCreateLectureDto.description,
        thumbnail: requestCreateLectureDto.thumbnail,
        images: requestCreateLectureDto.images,
        expiredAt: requestCreateLectureDto.expiredAt,
        teacherName: requestCreateLectureDto.teacherName,
        videoUrl: requestCreateLectureDto.videoUrl,
        videoTitle: requestCreateLectureDto.videoTitle,
      });
      if (!!!result) {
        throw new HttpException(
          '강의 등록에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '강의가 성공적으로 등록되었습니다' };
    } catch (err) {
      throw err;
    }
  }

  async updateLectureInfo(
    param: RequestLectureIdDto,
    requestUpdateLectureInfoDto: RequestUpdateLectureInfoDto,
  ) {
    try {
      const existLecture = await this.lecturesRepository.findOne({
        where: {
          id: +param.lectureId,
        },
      });
      existLecture.thumbnail = requestUpdateLectureInfoDto.thumbnail
        ? requestUpdateLectureInfoDto.thumbnail
        : existLecture.thumbnail;
      existLecture.expiredAt = requestUpdateLectureInfoDto.expired
        ? requestUpdateLectureInfoDto.expired
        : existLecture.expiredAt;
      existLecture.title = requestUpdateLectureInfoDto.title
        ? requestUpdateLectureInfoDto.title
        : existLecture.title;
      existLecture.description = requestUpdateLectureInfoDto.description
        ? requestUpdateLectureInfoDto.description
        : existLecture.description;
      existLecture.teacherName = requestUpdateLectureInfoDto.teacherName
        ? requestUpdateLectureInfoDto.teacherName
        : existLecture.teacherName;
      if (
        requestUpdateLectureInfoDto.img_description &&
        requestUpdateLectureInfoDto.img_description_index
      ) {
        existLecture.images[
          +requestUpdateLectureInfoDto.img_description_index
        ] = requestUpdateLectureInfoDto.img_description;
      }
      existLecture.videoTitle = requestUpdateLectureInfoDto.video_title
        ? requestUpdateLectureInfoDto.video_title
        : existLecture.videoTitle;
      existLecture.videoUrl = requestUpdateLectureInfoDto.video_url
        ? requestUpdateLectureInfoDto.video_url
        : existLecture.videoUrl;
      const result = await this.lecturesRepository.save(existLecture);
      if (!!!result) {
        throw new HttpException(
          '강의 등록에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '강의가 성공적으로 업데이트되었습니다' };
    } catch (err) {
      throw err;
    }
  }

  async deleteLecture(param: RequestLectureIdDto) {
    try {
      const lecture = await this.lecturesRepository.findOne({
        where: {
          id: +param.lectureId,
        },
      });
      const result = await this.lecturesRepository.delete({ id: lecture.id });
      if (!(!!result && result.affected === 1)) {
        throw new HttpException(
          '강의 삭제에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '강의가 성공적으로 삭제되었습니다' };
    } catch (err) {
      throw err;
    }
  }

  async getAllLectures() {
    try {
      const allLectures = await this.lecturesRepository
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
        .orderBy('lecture.title', 'DESC')
        .getRawMany();
      const responseLectures = [];
      await allLectures.reduce(async (prevPromise, lecture) => {
        return prevPromise.then(async () => {
          const tags = await this.lectureTagsRepository
            .createQueryBuilder('lecture_tag')
            .innerJoin('lecture_tag.lecture', 'lecture')
            .innerJoin('lecture_tag.tag', 'tag')
            .where('lecture.id = :lectureId', { lectureId: lecture.id })
            .select(['tag.id AS id', 'tag.name AS name'])
            .orderBy('tag.name', 'DESC')
            .getRawMany();
          responseLectures.push({
            id: lecture.id,
            title: lecture.title,
            images: lecture.images,
            description: lecture.description,
            thumbnail: lecture.thumbnail,
            teacher_nickname: lecture.teacher_nickname,
            expired: lecture.expired,
            tags,
            video_title: lecture.video_title,
            video_url: lecture.video_url,
          });
        });
      }, Promise.resolve());
      return responseLectures;
    } catch (err) {
      throw err;
    }
  }

  async getLectureByIdForGuest(pathParam: RequestLectureIdDto) {
    try {
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
          'lecture.videoUrl AS video_url',
          'lecture.videoTitle AS video_title',
        ])
        .getRawOne();
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
      return {
        id: lecture.id,
        title: lecture.title,
        description: lecture.description,
        thumbnail: lecture.thumbnail,
        images: lecture.images,
        teacher_nickname: lecture.teacher_nickname,
        expired: lecture.expired,
        video_title: lecture.video_title,
        video_url: lecture.video_url,
        notices,
        tags,
        users,
        qnas: [],
      };
    } catch (err) {
      throw err;
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
    } catch (err) {
      throw err;
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
    } catch (err) {
      throw err;
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
        return prevPromise.then(async () => {
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
        });
      }, Promise.resolve());
      return responseApprovedLectures;
    } catch (err) {
      throw err;
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
    } catch (err) {
      throw err;
    }
  }

  async connectUserWithLecture(pathParam: RequestLectureIdDto, user: User) {
    try {
      const result = await this.studentLecturesRepository.save({
        user: { id: user.id },
        lecture: { id: +pathParam.lectureId },
        status: CONST_LECTURE_STATUS.APPLY,
      });
      if (!!!result) {
        throw new HttpException(
          '강의 신청 중 오류가 발생하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '강의 신청이 완료되었습니다' };
    } catch (err) {
      throw err;
    }
  }

  async updateStatusLecture(
    pathParam: RequestLectureIdDto,
    queryParam: RequestUserIdDto,
    requestUpdateLectureStatus: RequestUpdateLectureStatusDto,
  ) {
    try {
      const result = await this.studentLecturesRepository.save({
        user: { id: +queryParam.user_id },
        lecture: { id: +pathParam.lectureId },
        status: requestUpdateLectureStatus.status,
      });
      if (!!!result) {
        throw new HttpException(
          '강의 상태 업데이트에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '성공적으로 강의 상태가 업데이트되었습니다' };
    } catch (err) {
      throw err;
    }
  }

  async createTag(requestTagNameDto: RequestTagNameDto) {
    try {
      const result = await this.tagsRepository.save({
        name: requestTagNameDto.name,
      });
      if (!!!result) {
        throw new HttpException(
          '태그 등록에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '성공적으로 태그가 등록되었습니다' };
    } catch (err) {
      throw err;
    }
  }

  async getAllTags() {
    try {
      return await this.tagsRepository
        .createQueryBuilder('tag')
        .select(['tag.id AS id', 'tag.name AS name'])
        .orderBy('tag.name', 'DESC')
        .getRawMany();
    } catch (err) {
      throw err;
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
    } catch (err) {
      throw err;
    }
  }

  async updateTag(
    pathParam: RequestTagIdDto,
    requestTagNameDto: RequestTagNameDto,
  ) {
    try {
      const tag = await this.tagsRepository.findOne({
        where: {
          id: +pathParam.tag_id,
        },
      });
      tag.name = requestTagNameDto.name;
      const result = await this.tagsRepository.save(tag);
      if (!!!result) {
        throw new HttpException(
          '태그 업데이트에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '성공적으로 태그가 업데이트되었습니다' };
    } catch (err) {
      throw err;
    }
  }

  async deleteTag(pathParam: RequestTagIdDto) {
    try {
      const tag = await this.tagsRepository.findOne({
        where: {
          id: +pathParam.tag_id,
        },
      });
      const result = await this.tagsRepository.delete({ id: tag.id });
      if (!(!!result && result.affected === 1)) {
        throw new HttpException(
          '태그 삭제에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '성공적으로 태그가 삭제되었습니다' };
    } catch (err) {
      throw err;
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
      const existTags = await this.lectureTagsRepository
        .createQueryBuilder('lecture_tag')
        .innerJoin('lecture_tag.lecture', 'lecture')
        .innerJoin('lecture_tag.tag', 'tag')
        .where('lecture.id = :lectureId', { lectureId: pathParam.lectureId })
        .select(['tag.id AS id'])
        .orderBy('tag.id', 'DESC')
        .getRawMany();
      await existTags.reduce(async (prevPromise, existTag) => {
        await prevPromise;
        const result = await this.lectureTagsRepository.delete({
          lecture: { id: +pathParam.lectureId },
          tag: { id: existTag.id },
        });
        if (!(!!result && result.affected === 1)) {
          throw new HttpException(
            '이미 등록된 태그 삭제에 실패하였습니다',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }, Promise.resolve());
      await ids.reduce(async (prevPromise, id) => {
        await prevPromise;
        const result = await this.lectureTagsRepository.save({
          lecture: { id: +pathParam.lectureId },
          tag: { id: +id },
        });
        if (!!!result) {
          throw new HttpException(
            '태그를 강의에 등록하는 중 오류가 발생하였습니다',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }, Promise.resolve());
      return { message: '태그가 성공적으로 강의에 등록되었습니다' };
    } catch (err) {
      throw err;
    }
  }

  async disconnectTagFromLecture(
    pathParam: RequestLectureIdDto,
    queryParam: RequestTagIdDto,
  ) {
    try {
      const existTag = await this.lectureTagsRepository
        .createQueryBuilder('lecture_tag')
        .innerJoin('lecture_tag.lecture', 'lecture')
        .innerJoin('lecture_tag.tag', 'tag')
        .where('lecture.id = :lectureId', { lectureId: pathParam.lectureId })
        .andWhere('tag.id = :tagId', { tagId: queryParam.tag_id })
        .select(['lecture.id AS lecture_id', 'tag.id AS tag_id'])
        .getRawOne();
      if (!!!existTag) {
        throw new HttpException(
          '존재하지 않는 태그입니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await this.lectureTagsRepository.delete({
        lecture: { id: existTag.lecture_id },
        tag: { id: existTag.tag_id },
      });
      if (!(!!result && result.affected === 1)) {
        throw new HttpException(
          '태그 삭제에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '태그가 성공적으로 강의에서 삭제되었습니다' };
    } catch (err) {
      throw err;
    }
  }

  async createNotice(
    pathParam: RequestLectureIdDto,
    user: User,
    requestTitleDescriptionDto: RequestTitleDescriptionDto,
  ) {
    try {
      const result = await this.lectureNoticesRepository.save({
        lecture: { id: +pathParam.lectureId },
        title: requestTitleDescriptionDto.title,
        description: requestTitleDescriptionDto.description,
      });
      if (!!!result) {
        throw new HttpException(
          '공지사항 등록에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '성공적으로 공지사항이 등록되었습니다' };
    } catch (err) {
      throw err;
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
    } catch (err) {
      throw err;
    }
  }

  async deleteNotice(
    pathParam: RequestLectureIdDto,
    queryParam: RequestNoticeIdDto,
  ) {
    try {
      const notice = await this.lectureNoticesRepository.findOne({
        where: {
          lecture: { id: +pathParam.lectureId },
          id: +queryParam.notice_id,
        },
      });
      if (!!!notice) {
        throw new HttpException(
          '존재하지 않는 공지사항입니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await this.lectureNoticesRepository.delete({
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
    } catch (err) {
      throw err;
    }
  }

  async updateNotice(
    pathParam: RequestLectureIdDto,
    queryParam: RequestNoticeIdDto,
    requestTitleDescriptionDto: RequestTitleDescriptionDto,
  ) {
    try {
      const notice = await this.lectureNoticesRepository.findOne({
        where: {
          lecture: { id: +pathParam.lectureId },
          id: +queryParam.notice_id,
        },
      });
      if (!!!notice) {
        throw new HttpException(
          '존재하지 않는 공지사항입니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await this.lectureNoticesRepository.save({
        id: +queryParam.notice_id,
        lecture: { id: +pathParam.lectureId },
        title: requestTitleDescriptionDto.title,
        description: requestTitleDescriptionDto.description,
      });
      if (!!!result) {
        throw new HttpException(
          '공지사항 업데이트에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '성공적으로 공지사항이 업데이트되었습니다' };
    } catch (err) {
      throw err;
    }
  }

  async createQuestion(
    pathParam: RequestLectureIdDto,
    user: User,
    requestTitleDescriptionDto: RequestTitleDescriptionDto,
  ) {
    try {
      const result = await this.questionsRepository.save({
        lecture: { id: +pathParam.lectureId },
        student: { id: +user.id },
        title: requestTitleDescriptionDto.title,
        description: requestTitleDescriptionDto.description,
      });
      if (!!!result) {
        throw new HttpException(
          '문의 등록에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '성공적으로 문의가 등록되었습니다' };
    } catch (err) {
      throw err;
    }
  }

  async deleteQuestion(
    pathParam: RequestLectureIdDto,
    user: User,
    queryParam: RequestQuestionIdDto,
  ) {
    try {
      const question = await this.questionsRepository.findOne({
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
          question.student.id !== user.id
        ) {
          throw new HttpException(
            '해당 요청은 문의를 등록한 학생 본인만 가능합니다',
            HttpStatus.FORBIDDEN,
          );
        }
      }
      if (!question) {
        throw new HttpException(
          '존재하지 않는 문의입니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await this.questionsRepository.delete({
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
    } catch (err) {
      throw err;
    }
  }

  async updateQuestion(
    pathParam: RequestLectureIdDto,
    user: User,
    queryParam: RequestQuestionIdDto,
    requestTitleDescriptionDto: RequestTitleDescriptionDto,
  ) {
    try {
      const question = await this.questionsRepository.findOne({
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
          question.student.id !== user.id
        ) {
          throw new HttpException(
            '해당 요청은 문의를 작성한 학생 본인만 가능합니다',
            HttpStatus.FORBIDDEN,
          );
        }
      }
      if (!!!question) {
        throw new HttpException(
          '존재하지 않는 문의입니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await this.questionsRepository.save({
        id: +queryParam.question_id,
        lecture: { id: +pathParam.lectureId },
        title: requestTitleDescriptionDto.title,
        description: requestTitleDescriptionDto.description,
      });
      if (!!!result) {
        throw new HttpException(
          '문의 업데이트에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '성공적으로 문의가 업데이트되었습니다' };
    } catch (err) {
      throw err;
    }
  }

  async createAnswer(requestCreateAnswerDto: RequestCreateAnswerDto) {
    try {
      const result = await this.answersRepository.save({
        question: { id: +requestCreateAnswerDto.question_id },
        title: requestCreateAnswerDto.title,
        description: requestCreateAnswerDto.description,
      });
      if (!!!result) {
        throw new HttpException(
          '답변 등록에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '성공적으로 답변이 등록되었습니다' };
    } catch (err) {
      throw err;
    }
  }

  async deleteAnswer(pathParam: RequestAnswerIdDto) {
    try {
      const answer = await this.answersRepository.findOne({
        where: {
          id: +pathParam.answer_id,
        },
      });
      if (!!!answer) {
        throw new HttpException(
          '존재하지 않는 답변입니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await this.answersRepository.delete({
        id: +pathParam.answer_id,
      });
      if (!(!!result && result.affected === 1)) {
        throw new HttpException(
          '답변 삭제에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '성공적으로 답변이 삭제되었습니다' };
    } catch (err) {
      throw err;
    }
  }

  async updateAnswer(
    pathParam: RequestQuestionIdDto,
    queryParam: RequestAnswerIdDto,
    requestTitleDescriptionDto: RequestTitleDescriptionDto,
  ) {
    try {
      const answer = await this.answersRepository.findOne({
        where: {
          question: { id: +pathParam.question_id },
          id: +queryParam.answer_id,
        },
      });
      if (!!!answer) {
        throw new HttpException(
          '존재하지 않는 답변입니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await this.answersRepository.save({
        id: +queryParam.answer_id,
        question: { id: +pathParam.question_id },
        title: requestTitleDescriptionDto.title,
        description: requestTitleDescriptionDto.description,
      });
      if (!!!result) {
        throw new HttpException(
          '답변 업데이트에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '성공적으로 답변이 업데이트되었습니다' };
    } catch (err) {
      throw err;
    }
  }
}
