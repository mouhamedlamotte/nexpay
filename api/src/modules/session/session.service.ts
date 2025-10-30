import { Injectable, NotFoundException } from '@nestjs/common';
import { LoggerService, PrismaService, SessionStatus } from 'src/lib';
import { InitiateSessionPaymentDto } from './dto/initiate-session-payment.dto';
import { ConfigService } from '@nestjs/config';

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
        },
        include: {
          payer: true,
          project: true,
        },
      });
      if (!session) {
        throw new NotFoundException('Checkout session not found or expired');
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
}
