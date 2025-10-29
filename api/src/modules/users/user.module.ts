import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TokensService } from 'src/lib/services/tokens.service';
import { LocalStrategy } from 'src/lib/strategies/local.stategy';

@Module({
  imports: [],
  providers: [UserService, TokensService, LocalStrategy],
  controllers: [UserController],
})
export class UsersModule {}
