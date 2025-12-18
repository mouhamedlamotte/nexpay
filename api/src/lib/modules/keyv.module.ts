import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { CACHE_TTL } from '../constants/cache.constants';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'KEYV',
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get(
          'REDIS_URI',
          'redis://localhost:63791',
        );
        const keyvRedis = new KeyvRedis(redisUrl);
        const keyv = new Keyv({
          store: keyvRedis,
          namespace: undefined,
        });

        await keyv.set('connection-test', 'ok', CACHE_TTL.VERY_SHORT);
        return keyv;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['KEYV'],
})
export class KeyvModule {}
