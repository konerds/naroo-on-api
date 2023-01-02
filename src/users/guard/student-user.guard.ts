import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import jwt_decode from 'jwt-decode';
import { CONST_ROLE_TYPE } from '../entity/user.entity';

@Injectable()
export class StudentUserGuard extends AuthGuard('jwt') {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const token = jwt_decode(req.headers.authorization);
    const role = token['role'];
    if (
      typeof role === typeof CONST_ROLE_TYPE &&
      role !== CONST_ROLE_TYPE.STUDENT
    ) {
      throw new HttpException(
        '해당 요청은 학생만 가능합니다',
        HttpStatus.FORBIDDEN,
      );
    }
    return super.canActivate(ctx);
  }
}
