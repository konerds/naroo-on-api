import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entity/user.entity';

export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    const user: User = Object.assign(req.user);
    user.id = +user.id;
    return user;
  },
);
