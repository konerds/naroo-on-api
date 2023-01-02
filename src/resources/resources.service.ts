import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Resource, RESOURCE_TYPE } from './entity/resource.entity';
import { CONST_ROLE_TYPE, User } from '../users/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourcesRepository: Repository<Resource>,
  ) {}

  async createResourceContent(
    user: User,
    requestCreateResourceContentDto: {
      type: RESOURCE_TYPE;
      content: string;
    },
  ) {
    try {
      if (
        typeof user.role === typeof CONST_ROLE_TYPE &&
        user.role !== CONST_ROLE_TYPE.ADMIN
      ) {
        throw new HttpException('관리자 권한이 없습니다', HttpStatus.FORBIDDEN);
      }
      const result = await this.resourcesRepository.save({
        type: requestCreateResourceContentDto.type,
        content: requestCreateResourceContentDto.content,
      });
      if (!!!result) {
        throw new HttpException(
          '리소스 등록에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '리소스가 성공적으로 등록되었습니다' };
    } catch (err) {
      throw err;
    }
  }

  async updateResourceContent(
    user: User,
    requestUpdateResourceContentDto: {
      type: RESOURCE_TYPE;
      content_id: string;
      content: string;
    },
  ) {
    try {
      if (
        typeof user.role === typeof CONST_ROLE_TYPE &&
        user.role !== CONST_ROLE_TYPE.ADMIN
      ) {
        throw new HttpException('관리자 권한이 없습니다', HttpStatus.FORBIDDEN);
      }
      const resource = await this.resourcesRepository.findOne({
        where: {
          type: requestUpdateResourceContentDto.type,
          content_id: +requestUpdateResourceContentDto.content_id,
        },
      });
      if (!!!resource) {
        throw new HttpException(
          '존재하지 않는 리소스입니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      resource.content = requestUpdateResourceContentDto.content;
      const result = await this.resourcesRepository.save(resource);
      if (!!!result) {
        throw new HttpException(
          '리소스 업데이트에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '리소스가 성공적으로 업데이트되었습니다' };
    } catch (err) {
      throw err;
    }
  }

  async getAllResources(user: User) {
    try {
      if (
        typeof user.role === typeof CONST_ROLE_TYPE &&
        user.role !== CONST_ROLE_TYPE.ADMIN
      ) {
        throw new HttpException('관리자 권한이 없습니다', HttpStatus.FORBIDDEN);
      }
      return await this.resourcesRepository.find({
        select: ['type', 'content_id', 'content'],
        order: {
          type: 'ASC',
          content_id: 'ASC',
        },
      });
    } catch (err) {
      throw err;
    }
  }

  async getResourceContent(param: { type: string }) {
    try {
      return await this.resourcesRepository.find({
        where: {
          type: param.type as RESOURCE_TYPE,
        },
        select: ['content'],
        order: {
          content_id: 'ASC',
        },
      });
    } catch (err) {
      throw err;
    }
  }

  async deleteResource(
    pathParam: { content_id: string },
    queryParam: { type: string },
    user: User,
  ) {
    try {
      if (
        typeof user.role === typeof CONST_ROLE_TYPE &&
        user.role !== CONST_ROLE_TYPE.ADMIN
      ) {
        throw new HttpException('관리자 권한이 없습니다', HttpStatus.FORBIDDEN);
      }
      if (+pathParam.content_id === 0) {
        throw new HttpException(
          '기본 리소스는 삭제할 수 없습니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      const resource = await this.resourcesRepository.findOne({
        where: {
          type: queryParam.type as RESOURCE_TYPE,
          content_id: +pathParam.content_id,
        },
      });
      const result = await this.resourcesRepository.delete(resource);
      if (!(!!result && result.affected === 1)) {
        throw new HttpException(
          '리소스 삭제에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '리소스가 성공적으로 삭제되었습니다' };
    } catch (err) {
      throw err;
    }
  }
}
