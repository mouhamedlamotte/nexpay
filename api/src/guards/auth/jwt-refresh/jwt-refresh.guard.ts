import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('refresh-jwt-bearer') {
  handleRequest(err, user, info, context) {
    Logger.debug('JwtAuthGuard triggered');

    if (err) {
      Logger.debug(err.message);
      // throw new
      //   UnauthorizedException(err.message);
    }

    if (info) {
      Logger.debug(info.message);
    }
    if (!user) {
      Logger.debug('No user found');
      // throw new

      //   UnauthorizedException('No user found');
    }

    return super.handleRequest(err, user, info, context);
  }
}
