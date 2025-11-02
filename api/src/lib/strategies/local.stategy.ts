import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/modules/users/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly auth: UserService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(username: string, password: string): Promise<unknown> {
    console.log(username, password);

    const user = await this.auth.validateEmailAndPasswordUser(
      username,
      password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
  }
}
