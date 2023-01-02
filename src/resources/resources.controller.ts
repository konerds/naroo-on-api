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
} from '@nestjs/common';
import { JwtAuthGuard } from '../users/guard/jwt.guard';
import { ResourcesService } from './resources.service';
import { RESOURCE_TYPE } from './entity/resource.entity';
import { GetUser } from '../users/decorator/get-user.decorator';
import { User } from '../users/entity/user.entity';
import { ErrorsInterceptor } from 'src/common/entity/errors.interceptor';

@Controller('resource')
@UseInterceptors(ErrorsInterceptor)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createResourceContent(
    @GetUser() user: User,
    @Body()
    requestCreateResourceContentDto: {
      type: RESOURCE_TYPE;
      content: string;
    },
  ) {
    return this.resourcesService.createResourceContent(
      user,
      requestCreateResourceContentDto,
    );
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  updateResourceContent(
    @GetUser() user: User,
    @Body()
    requestUpdateResourceContentDto: {
      type: RESOURCE_TYPE;
      content_id: string;
      content: string;
    },
  ) {
    return this.resourcesService.updateResourceContent(
      user,
      requestUpdateResourceContentDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getAllResources(@GetUser() user: User) {
    return this.resourcesService.getAllResources(user);
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
    return this.resourcesService.deleteResource(pathParam, queryParam, user);
  }
}
