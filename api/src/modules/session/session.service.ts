import { Injectable, NotFoundException } from '@nestjs/common';
import { LoggerService, PrismaService, SessionStatus } from 'src/lib';
import { InitiateSessionPaymentDto } from './dto/initiate-session-payment.dto';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from '../public/payments/payments.service';
import { CheckoutSessionPaymentDto } from './dto/CheckoutSessionPaymentDto';

export interface SessionPaymenResponse {
  sessionId: string;
  checkoutUrl: string;
  status: SessionStatus;
  expiresAt: Date;
}

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly env: ConfigService,
    private readonly payment: PaymentsService,
  ) {
    this.logger.setContext(SessionService.name);
  }

  async initiateSessionPayment(
    dto: InitiateSessionPaymentDto,
  ): Promise<SessionPaymenResponse> {
    try {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      const session = await this.prisma.session.create({
        data: {
          amount: dto.amount,
          currency: dto.currency,
          expiresAt,
          clientReference: dto.client_reference,
          project: {
            connect: {
              id: dto.projectId,
            },
          },
          payer: {
            create: {
              userId: dto.userId,
              email: dto.email,
              phone: dto.phone,
              name: dto.name,
            },
          },
        },
      });

      const checkoutUrl = `${this.env.get('app.url')}/checkout/${session.id}`;

      return {
        sessionId: session.id,
        checkoutUrl,
        status: session.status,
        expiresAt: session.expiresAt,
      };
    } catch (error) {
      this.logger.error('Error initiating session payment', error);
      throw error;
    }
  }

  async getSession(id: string, selectExpired: boolean = false) {
    try {
      const session = await this.prisma.session.findUnique({
        where: {
          id,
          expiresAt: selectExpired ? undefined : { gt: new Date() },
          status: SessionStatus.opened,
        },
        include: {
          payer: true,
          project: true,
        },
      });
      if (!session) {
        throw new NotFoundException('Checkout session not found or expired');
      }

      let paymentData;
      if (session.paymentData) {
        paymentData = JSON.parse(session.paymentData);
      }

      if (
        paymentData &&
        paymentData.expiration &&
        new Date(paymentData.expiration) < new Date()
      ) {
        session.paymentData = null;
        await this.prisma.session.update({
          where: { id },
          data: { paymentData: null },
        });
      }

      const providers = await this.prisma.paymentProvider.findMany({
        where: { isActive: true },
        select: { id: true, name: true, code: true, logoUrl: true },
      });
      const checkoutUrl = `${this.env.get('app.url')}/checkout/${session.id}`;
      return {
        ...session,
        checkoutUrl,
        providers,
      };
    } catch (error) {
      this.logger.error('Error fetching session', error);
      throw error;
    }
  }

  async checkoutSessionPayment(
    sessionId: string,
    dto: CheckoutSessionPaymentDto,
  ) {
    try {
      const session = await this.prisma.session.findUnique({
        where: {
          id: sessionId,
          status: SessionStatus.opened,
          expiresAt: { gt: new Date() },
        },
        include: {
          payer: true,
          project: true,
        },
      });
      if (!session) {
        throw new NotFoundException('Checkout session not found or expired');
      }

      let paymentData;
      if (session.paymentData) {
        paymentData = JSON.parse(session.paymentData);
      }

      console.log(JSON.stringify(paymentData, null, 2));
      console.log(JSON.stringify(dto, null, 2));

      if (
        paymentData &&
        paymentData.expiration &&
        new Date(paymentData.expiration) > new Date() &&
        paymentData.provider?.code === dto.provider
      ) {
        return paymentData;
      }
      paymentData = await this.payment.initiatePayment({
        ...dto,
        amount: Number(session.amount),
        currency: session.currency,
        userId: session.payer.userId,
        name: session.payer.name,
        phone: session.payer.phone,
        email: session.payer.email,
        client_reference: session.clientReference,
        projectId: session.projectId,
      });
      await this.prisma.session.update({
        where: {
          id: sessionId,
        },
        data: {
          paymentData: JSON.stringify(paymentData),
        },
      });

      return paymentData;
    } catch (error) {
      this.logger.error('Error fetching session', error);
      throw error;
    }
  }
}
