// jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  mixin,
  Type,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export function JwtAuthGuard(): Type<CanActivate> {
  @Injectable()
  class JwtAuthGuardMixin implements CanActivate {
    constructor(private readonly jwt: JwtService) {}

    async canActivate(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest<any>();
      const authHeader = req.headers?.authorization;

      if (!authHeader) {
        throw new UnauthorizedException(
          'Missed Authorization header and cookies',
        );
      }

      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new UnauthorizedException('Invalid Authorization header format');
      }

      const token = parts[1];

      try {
        const payload = await this.jwt.verifyAsync(token);
        console.log(payload);

        req.user = payload;
        return true;
        // eslint-disable-next-line
      } catch (err) {
        throw new UnauthorizedException('Invalid authentication token');
      }
    }
  }

  return mixin(JwtAuthGuardMixin);
}
