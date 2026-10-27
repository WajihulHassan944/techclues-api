import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AdminRole } from '../../database/schemas/admin.schema';

export interface AuthUser {
  sub: string;
  email: string;
  role: AdminRole;
  sid: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<Request & { user: AuthUser }>();
    return request.user;
  },
);
