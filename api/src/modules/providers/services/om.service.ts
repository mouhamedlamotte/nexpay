import { Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import Keyv from 'keyv';
import { ORANGE_MONEY_API_URL, ORANGE_MONEY_GRANT_TYPE } from 'src/lib';

@Injectable()
export class OMService {
  private readonly logger = new Logger(OMService.name);

  constructor(
    private readonly http: HttpService,
    @Inject('KEYV') private readonly keyv: Keyv,
  ) {}

  async getToken(creds: { client_id: string; client_secret: string }) {
    const cacheKey = `om-token`;
    const cachedToken = await this.keyv.get(cacheKey);
    if (cachedToken) return cachedToken;

    this.logger.debug('Fetching new OM access token');
    try {
      const response = await firstValueFrom(
        this.http.post(
          `${ORANGE_MONEY_API_URL}/oauth/token`,
          {
            ...creds,
            grant_type: ORANGE_MONEY_GRANT_TYPE,
          },
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        ),
      );

      this.logger.debug('OM access token response', response.data);

      const { access_token, expires_in } = response.data;
      this.keyv.set(cacheKey, access_token, expires_in * 1000);
      return access_token;
    } catch (error) {
      this.logger.error('Error fetching OM access token', error);
      throw new Error(
        'Error getting OM token, Please consider checking your credentials',
      );
    }
  }
}
