import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import {
  DEFAULT_CANCEL_URL,
  DEFAULT_SUCCESS_URL,
  WAVE_CHECKOUT_URL,
} from 'src/lib/constants';
import {
  PaymentAdapter,
  PaymentInitiationData,
  PaymentResponse,
} from './interface';
import { TransactionFactory } from '../helpers/transaction.factory';
import { LoggerService } from 'src/lib/services/logger.service';
import { HashService } from 'src/lib';

interface WaveCheckoutParams {
  amount: string;
  currency: string;
  error_url?: string;
  success_url?: string;
  client_reference?: string;
}

@Injectable()
export class WaveService implements PaymentAdapter {
  constructor(
    private readonly logger: LoggerService,
    private readonly transactionFactory: TransactionFactory,
    private readonly http: HttpService,
    private readonly hash: HashService,
  ) {
    this.logger.setContext(WaveService.name);
  }

  async initiate(data: PaymentInitiationData): Promise<PaymentResponse> {
    try {
      const checkoutParams: WaveCheckoutParams = {
        amount: data.amount.toString(),
        currency: data.currency,
        client_reference: data.reference,
        success_url: data.successUrl ?? DEFAULT_SUCCESS_URL,
        error_url: data.cancelUrl ?? DEFAULT_CANCEL_URL,
      };

      const { api_key } = data.secrets;

      console.log(api_key.replace('"', '').replace('"', ''));

      const finalkey = api_key.replace('"', '').replace('"', '');
      this.logger.debug('Wave key', finalkey);

      const response = await firstValueFrom(
        this.http.post(WAVE_CHECKOUT_URL, checkoutParams, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${finalkey}`,
          },
        }),
      );

      this.logger.debug('Wave response', response.data);

      if (![200, 201].includes(response.status)) {
        this.logger.error('Error initiating Wave payment', response.data);
        throw new Error('Wave initiation failed');
      }

      const transaction = await this.transactionFactory.createTransaction({
        ...data,
        providerTransactionId: response.data.id,
        expiresAt: new Date(response.data.when_expires),
      });
      const THUMB_URL = `https://${process.env.APP_DOMAIN}/${process.env.GLOBAL_PREFIX}/media/images/thumbs`;

      return {
        provider: {
          id: transaction.provider.id,
          name: transaction.provider.name,
          code: transaction.provider.code,
          logoUrl: transaction.provider.logoUrl,
        },
        amount: data.amount,
        currency: transaction.currency,
        reference: transaction.reference,
        payer: {
          userId: transaction.payer.userId,
          email: transaction.payer.email,
          phone: transaction.payer.phone,
          name: transaction.payer.name,
        },
        checkout_urls: [
          {
            name: 'wave launch url',
            url: response.data.wave_launch_url,
            thumb: `${THUMB_URL}/wave.png`,
          },
        ],
        qr_code: {
          url: response.data.wave_launch_url,
        },
        expiration: transaction.expiresAt?.toISOString(),
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
