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
import { ResourcesService } from './resources.service';
import { RESOURCE_TYPE } from './entity/resource.entity';
import { GetUser } from '../users/decorator/get-user.decorator';
import { User } from '../users/entity/user.entity';
import { ErrorsInterceptor } from '../interceptors/errors.interceptor';
import { AdminUserGuard } from '../users/guard/admin-user.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('resource')
@UseInterceptors(ErrorsInterceptor)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @UseGuards(AdminUserGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'content', maxCount: 1 }]))
  createResourceContent(
    @GetUser() user: User,
    @UploadedFiles() files: Express.MulterS3.File[],
    @Body()
    requestCreateResourceContentDto: {
      type: RESOURCE_TYPE;
      content: any;
    },
  ) {
    const { content } = JSON.parse(JSON.stringify(files));
    return this.resourcesService.createResourceContent({
      ...requestCreateResourceContentDto,
      content: content[0].location,
    });
  }

  @Put()
  @UseGuards(AdminUserGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'content', maxCount: 1 }]))
  updateResourceContent(
    @GetUser() user: User,
    @UploadedFiles() files: Express.MulterS3.File[],
    @Body()
    requestUpdateResourceContentDto: {
      type: RESOURCE_TYPE;
      content_id: string;
      content: any;
    },
  ) {
    const { content } = JSON.parse(JSON.stringify(files));
    return this.resourcesService.updateResourceContent({
      ...requestUpdateResourceContentDto,
      content: content[0].location,
    });
  }

  @Get()
  @UseGuards(AdminUserGuard)
  getAllResources(@GetUser() user: User) {
    return this.resourcesService.getAllResources();
  }

  @Get('/:type')
  getResourceContent(@Param() param: { type: string }) {
    return this.resourcesService.getResourceContent(param);
  }

  @Delete('/:content_id')
  @UseGuards(JwtAuthGuard)
  deleteResource(
    @Param() pathParam: { content_id: string },
    @Query() queryParam: { type: string },
    @GetUser() user: User,
  ) {
    return this.resourcesService.deleteResource(pathParam, queryParam);
  }
}
