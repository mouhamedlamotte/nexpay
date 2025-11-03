import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  DEFAULT_CANCEL_URL,
  DEFAULT_SUCCESS_URL,
  ORANGE_MONEY_API_URL,
  PAYEMENT_VALIDITY,
} from 'src/lib/constants';
import {
  PaymentAdapter,
  PaymentInitiationData,
  PaymentResponse,
} from './interface';
import { TransactionFactory } from '../helpers/transaction.factory';
import { OMService } from 'src/modules/providers/services/om.service';

interface OMCheckoutParams {
  amount: { value: number; unit: string };
  reference: string;
  validity: number;
  name: string;
  code: string;
  callbackCancelUrl?: string;
  callbackSuccessUrl?: string;
}

@Injectable()
export class OMAdapder implements PaymentAdapter {
  private readonly logger = new Logger(OMAdapder.name);

  constructor(
    private readonly omService: OMService,
    private readonly transactionFactory: TransactionFactory,
    private readonly http: HttpService,
  ) {}

  async initiate(data: PaymentInitiationData): Promise<PaymentResponse> {
    try {
      const { amount, currency, reference, secrets } = data;
      const { name, code, client_id, client_secret } = secrets;

      const checkoutParams: OMCheckoutParams = {
        amount: { value: amount, unit: currency },
        reference,
        validity: PAYEMENT_VALIDITY,
        name,
        code,
        callbackSuccessUrl: data.successUrl ?? DEFAULT_SUCCESS_URL,
        callbackCancelUrl: data.cancelUrl ?? DEFAULT_CANCEL_URL,
      };

      const token = await this.omService.getToken({
        client_id,
        client_secret,
      });

      const response = await firstValueFrom(
        this.http.post(
          `${ORANGE_MONEY_API_URL}/api/eWallet/v4/qrcode`,
          checkoutParams,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      );

      if (![200, 201].includes(response.status)) {
        this.logger.error('Error initiating OM payment', response.data);
        throw new Error('OM initiation failed');
      }

      const transaction = await this.transactionFactory.createTransaction({
        ...data,
        providerTransactionId: response.data.id,
        expiresAt: new Date(response.data.validFor?.endDateTime),
      });
      const THUMB_URL = `https://${process.env.APP_DOMAIN}/${process.env.GLOBAL_PREFIX}/media/images/thumbs`;

      return {
        amount,
        provider: {
          id: transaction.provider.id,
          name: transaction.provider.name,
          code: transaction.provider.code,
          logoUrl: transaction.provider.logoUrl,
        },
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
            name: 'MaxIt',
            url: response.data.deepLinks?.MAXIT,
            thumb: `${THUMB_URL}/maxit.png`,
          },
          {
            name: 'Orange Money',
            url: response.data.deepLinks?.OM,
            thumb: `${THUMB_URL}/om.png`,
          },
        ],
        qr_code: { data: response.data.qrCode },
        expiration: transaction.expiresAt?.toISOString(),
      };
    } catch (error) {
      this.logger.error('Error initiating OM payment', error);
      throw error;
    }
  }
}
