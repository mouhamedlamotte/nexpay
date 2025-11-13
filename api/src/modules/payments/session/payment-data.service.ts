import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PaymentDataService {
  private readonly logger = new Logger(PaymentDataService.name);

  parsePaymentData(paymentDataString: string | null): any | null {
    if (!paymentDataString) return null;

    try {
      return JSON.parse(paymentDataString);
    } catch (error) {
      this.logger.error('Failed to parse payment data', error);
      return null;
    }
  }

  isPaymentDataExpired(paymentData: any): boolean {
    return (
      paymentData &&
      paymentData.expiration &&
      new Date(paymentData.expiration) < new Date()
    );
  }

  isPaymentDataValid(paymentData: any, providerCode: string): boolean {
    return (
      paymentData &&
      paymentData.expiration &&
      new Date(paymentData.expiration) > new Date() &&
      paymentData.provider?.code === providerCode
    );
  }

  serializePaymentData(data: any): string {
    try {
      return JSON.stringify(data);
    } catch (error) {
      throw new Error(`Failed to serialize payment data: ${error.message}`);
    }
  }
}
