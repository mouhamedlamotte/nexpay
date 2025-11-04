import { Injectable, NotFoundException } from '@nestjs/common';
import { LoggerService, PrismaService, SessionStatus } from 'src/lib';
import { InitiateSessionPaymentDto } from './dto/initiate-session-payment.dto';
import { ConfigService } from '@nestjs/config';
import { CheckoutSessionPaymentDto } from './dto/CheckoutSessionPaymentDto';
import { PaymentsService } from '../payments.service';

export interface SessionPaymenResponse {
  sessionId: string;
  checkoutUrl: string;
  status: SessionStatus;
  expiresAt: Date;
}

@Injectable()
export class SessionPayemtService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly env: ConfigService,
    private readonly payment: PaymentsService,
  ) {
    this.logger.setContext(SessionPayemtService.name);
  }

  async initiateSessionPayment(
    dto: InitiateSessionPaymentDto,
  ): Promise<SessionPaymenResponse> {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });
      if (!project) {
        throw new NotFoundException('This project does not exist');
      }

      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      const payerData = {
        name: dto.name,
        email: dto.email,
        userId: dto.userId,
      };
      const payer = await this.prisma.payer.upsert({
        where: {
          phone: dto.phone,
        },
        update: payerData,
        create: {
          ...payerData,
          phone: dto.phone,
        },
      });

      const appHasActivePaymentProvider =
        await this.prisma.paymentProvider.count({
          where: {
            isActive: true,
          },
        });

      if (appHasActivePaymentProvider === 0) {
        throw new NotFoundException(
          'No payment provider is active for this app, please add and activate configation for your payment provider',
        );
      }

      const callbacks = await this.prisma.callback.findUnique({
        where: { projectId: dto.projectId },
      });

      if (!dto.successUrl) {
        dto.successUrl = callbacks.successUrl;
      }

      if (!dto.cancelUrl) {
        dto.cancelUrl = callbacks.cancelUrl;
      }

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
            connect: {
              id: payer.id,
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
          status: {
            in: [SessionStatus.opened, SessionStatus.pending],
          },
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
        where: { isActive: true, hasValidSecretConfig: true },
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
          status: {
            in: [SessionStatus.opened, SessionStatus.pending],
          },
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

      if (
        paymentData &&
        paymentData.expiration &&
        new Date(paymentData.expiration) > new Date() &&
        paymentData.provider?.code === dto.provider
      ) {
        return paymentData;
      }
      paymentData = await this.payment.initiatePayment(
        {
          ...dto,
          amount: Number(session.amount),
          currency: session.currency,
          userId: session.payer.userId,
          name: session.payer.name,
          phone: session.payer.phone,
          email: session.payer.email,
          client_reference: session.clientReference,
          projectId: session.projectId,
        },
        sessionId,
      );

      const callbacks = await this.prisma.callback.findUnique({
        where: { projectId: session.projectId },
      });

      if (!dto.successUrl) {
        dto.successUrl = callbacks.successUrl;
      }

      if (!dto.cancelUrl) {
        dto.cancelUrl = callbacks.cancelUrl;
      }
      await this.prisma.session.update({
        where: {
          id: sessionId,
        },
        data: {
          status: SessionStatus.pending,
          paymentData: JSON.stringify(paymentData),
          successUrl: dto.successUrl,
          cancelUrl: dto.cancelUrl,
        },
      });

      return paymentData;
    } catch (error) {
      this.logger.error('Error fetching session', error);
      throw error;
    }
  }

  async waitSessionPaymentStatus(id: string): Promise<{
    sessionId: string;
    status: SessionStatus;
    redirectUrl: string | null;
  }> {
    try {
      const start = new Date();
      const timeout = 30000;

      while (Date.now() - start.getTime() < timeout) {
        const session = await this.prisma.session.findUnique({
          where: {
            id,
          },
        });

        if (!session) {
          throw new NotFoundException('Checkout session not found or expired');
        }

        if (session.status !== 'pending') {
          return {
            sessionId: session.id,
            status: session.status,
            redirectUrl: this.getRedirectUrl(
              session.status,
              session.cancelUrl,
              session.successUrl,
            ),
          };
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      return {
        sessionId: id,
        status: SessionStatus.opened,
        redirectUrl: null,
      };
    } catch (error) {
      this.logger.error('Error fetching session', error);
      throw error;
    }
  }

  getRedirectUrl(status: SessionStatus, cancelUrl: string, successUrl: string) {
    if (status === 'failed') return cancelUrl;
    if (status === 'completed') return successUrl;
    return null;
  }
}
