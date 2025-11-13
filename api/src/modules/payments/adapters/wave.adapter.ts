import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { WAVE_CHECKOUT_URL } from 'src/lib/constants';
import {
  PaymentAdapter,
  PaymentInitiationData,
  PaymentResponse,
} from './interface';
import { TransactionFactory } from '../helpers/transaction.factory';
import { LoggerService } from 'src/lib/services/logger.service';
import { ConfigService } from '@nestjs/config';

interface WaveCheckoutParams {
  amount: string;
  currency: string;
  error_url?: string;
  success_url?: string;
  client_reference?: string;
}

@Injectable()
export class WaveAdapter implements PaymentAdapter {
  constructor(
    private readonly logger: LoggerService,
    private readonly transactionFactory: TransactionFactory,
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.logger.setContext(WaveAdapter.name);
  }

  async initiate(data: PaymentInitiationData): Promise<PaymentResponse> {
    const APP_URL = this.config.get('app.url');
    try {
      const checkoutParams: WaveCheckoutParams = {
        amount: data.amount.toString(),
        currency: data.currency,
        client_reference: data.reference,
        success_url: data.successUrl,
        error_url: data.failureUrl,
      };

      if (
        checkoutParams.success_url &&
        checkoutParams.success_url?.includes('localhost')
      ) {
        checkoutParams.success_url = 'https://exemple.com/success';
      }

      if (data.failureUrl && data.failureUrl?.includes('localhost')) {
        checkoutParams.error_url = 'https://exemple.com/failure';
      }

      const { api_key } = data.secrets;

      // ! LOL C"EST MOI QUI AI FAIS CA ???
      const finalkey = api_key.replace('"', '').replace('"', '');

      let response: any;

      try {
        response = await firstValueFrom(
          this.http.post(WAVE_CHECKOUT_URL, checkoutParams, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${finalkey}`,
            },
          }),
        );
        if (![200, 201].includes(response.status)) {
          this.logger.error('Error initiating Wave payment', response.data);
          throw new Error('Wave initiation failed, check your API key !');
        }
      } catch (error) {
        this.logger.error('Error initiating Wave payment', error);
        throw new Error('Wave initiation failed, check your API key !');
      }

      const transaction = await this.transactionFactory.createTransaction({
        ...data,
        providerTransactionId: response.data.id,
        expiresAt: new Date(response.data.when_expires),
      });
      const THUMB_URL = `${APP_URL}/${process.env.GLOBAL_PREFIX}/media/images/thumbs`;

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
