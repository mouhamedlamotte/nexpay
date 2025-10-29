import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';

@Injectable()
export class TokensService {
  constructor(private readonly jwtService: JwtService) {}

  async genrerateAccessAndRefreshToken(id: string, refresh_secret?: string) {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync({
        id,
      }),
      this.jwtService.signAsync(
        {
          id,
        },
        {
          expiresIn: '7d',
          secret: refresh_secret || process.env.JWT_REFRESH_SECRET,
        },
      ),
    ]);
    return {
      access_token,
      refresh_token,
    };
  }

  generateCryptoToken(length = 64) {
    return crypto.randomBytes(length).toString('hex');
  }

  async hashToken(token: string) {
    return await argon2.hash(token);
  }

  async compareTokens(token: string, hashedToken: string) {
    try {
      const res = await argon2.verify(hashedToken, token);
      return res;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false;
    }
  }
}
