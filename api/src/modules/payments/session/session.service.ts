import { Injectable, NotFoundException } from '@nestjs/common';
import { LoggerService, PrismaService, SessionStatus } from 'src/lib';
import { InitiateSessionPaymentDto } from './dto/initiate-session-payment.dto';
import { ConfigService } from '@nestjs/config';
import { CheckoutSessionPaymentDto } from './dto/CheckoutSessionPaymentDto';
import { PaymentsService } from '../payments.service';
import { SessionRepository } from './session.repository';
import { PaymentDataService } from './payment-data.service';
import { CallbacksService } from 'src/modules/projects/settings/callbacks/redirects.service';
import { PayerService } from 'src/modules/projects/transactions/payer.service';
import { ProvidersService } from 'src/modules/providers/providers.service';
import { SessionPaymentResponse, SessionStatusResponse } from './interfaces';
import { SESSION_CONSTANTS } from 'src/lib/constants/session-payment.constants';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { TestSessionPaymentDto } from 'src/modules/payments/session/dto/test-session-payment.dto';

@Injectable()
export class SessionPaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly env: ConfigService,
    private readonly payment: PaymentsService,
    private readonly callbackService: CallbacksService,
    private readonly payerService: PayerService,
    private readonly providerService: ProvidersService,
    private readonly sessionRepo: SessionRepository,
    private readonly paymentDataService: PaymentDataService,
  ) {
    this.logger.setContext(SessionPaymentService.name);
  }

  async initiateSessionPayment(
    dto: InitiateSessionPaymentDto,
  ): Promise<SessionPaymentResponse> {
    try {
      await this.validateProject(dto.projectId);

      await this.providerService.validateActiveProvidersExist();

      const payer = await this.payerService.upsertPayer({
        name: dto.name,
        email: dto.email,
        userId: dto.userId,
        phone: dto.phone,
      });

      // Create session
      const expiresAt = new Date(
        Date.now() + SESSION_CONSTANTS.EXPIRATION_TIME_MS,
      );
      const session = await this.sessionRepo.createSession({
        amount: dto.amount,
        currency: dto.currency,
        expiresAt,
        clientReference: dto.client_reference,
        projectId: dto.projectId,
        payerId: payer.id,
      });

      const checkoutUrl = this.buildCheckoutUrl(session.id);

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

  async getSession(id: string, selectExpired = false) {
    try {
      const session = await this.sessionRepo.findActiveSession(
        id,
        selectExpired,
      );

      if (!session) {
        throw new NotFoundException('Checkout session not found or expired');
      }

      const paymentData = this.paymentDataService.parsePaymentData(
        session.paymentData,
      );

      if (this.paymentDataService.isPaymentDataExpired(paymentData)) {
        await this.sessionRepo.updateSession(id, { paymentData: null });
        session.paymentData = null;
      }

      const providers = await this.providerService.getActiveProviders();

      const checkoutUrl = this.buildCheckoutUrl(session.id);

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
      const session = await this.sessionRepo.findActiveSession(sessionId);

      if (!session) {
        throw new NotFoundException('Checkout session not found or expired');
      }

      const existingPaymentData = this.paymentDataService.parsePaymentData(
        session.paymentData,
      );

      if (
        this.paymentDataService.isPaymentDataValid(
          existingPaymentData,
          dto.provider,
        )
      ) {
        return existingPaymentData;
      }

      const paymentData = await this.payment.initiatePayment(
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

      const defaultCallbacks = await this.callbackService.getCallbackUrls(
        session.projectId,
      );
      const callbacks = this.callbackService.mergeCallbackUrls(
        dto,
        defaultCallbacks,
      );

      await this.sessionRepo.updateSession(sessionId, {
        status: SessionStatus.pending,
        paymentData: this.paymentDataService.serializePaymentData(paymentData),
        successUrl: callbacks.successUrl,
        failureUrl: callbacks.failureUrl,
      });

      return paymentData;
    } catch (error) {
      this.logger.error('Error processing checkout session payment', error);
      throw error;
    }
  }

  async waitSessionPaymentStatus(id: string): Promise<SessionStatusResponse> {
    try {
      const startTime = Date.now();

      while (
        Date.now() - startTime <
        SESSION_CONSTANTS.STATUS_POLL_TIMEOUT_MS
      ) {
        const session = await this.sessionRepo.findSessionById(id);

        if (!session) {
          throw new NotFoundException('Checkout session not found');
        }

        if (session.status !== SessionStatus.pending) {
          return {
            sessionId: session.id,
            status: session.status,
            redirectUrl: this.getRedirectUrl(
              session.status,
              session.failureUrl,
              session.successUrl,
            ),
          };
        }

        await this.sleep(SESSION_CONSTANTS.STATUS_POLL_INTERVAL_MS);
      }

      return {
        sessionId: id,
        status: SessionStatus.opened,
        redirectUrl: null,
      };
    } catch (error) {
      this.logger.error('Error waiting for session payment status', error);
      throw error;
    }
  }

  private async validateProject(projectId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('This project does not exist');
    }
  }

  private buildCheckoutUrl(sessionId: string): string {
    return `${this.env.get('app.url')}/checkout/${sessionId}`;
  }

  private getRedirectUrl(
    status: SessionStatus,
    failureUrl: string | null,
    successUrl: string | null,
  ): string | null {
    if (status === SessionStatus.failed) return failureUrl;
    if (status === SessionStatus.completed) return successUrl;
    return null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async testSessionPayment(
    userId: string,
    code: string,
    dto: TestSessionPaymentDto,
  ) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      const data: InitiatePaymentDto = {
        ...dto,
        email: user.email,
        name: user.firstName + ' ' + user.lastName,
        userId: user.id,
        provider: code,
      };

      if (!user) throw new NotFoundException('User not found');
      const session = await this.initiateSessionPayment(data);
      try {
        const checkout = await this.checkoutSessionPayment(session.sessionId, {
          provider: code,
        });
        if (checkout) {
          await this.prisma.paymentProvider.update({
            where: { code },
            data: { hasValidSecretConfig: true, hastSecretTestPassed: true },
          });
          return session;
        }
      } catch (error) {
        await this.prisma.paymentProvider.update({
          where: { code },
          data: { hastSecretTestPassed: false },
        });
        throw error;
      }
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
