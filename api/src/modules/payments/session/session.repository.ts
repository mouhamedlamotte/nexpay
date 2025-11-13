import { Injectable } from '@nestjs/common';
import { Currency, PrismaService, SessionStatus } from 'src/lib';
import { SESSION_STATUSES } from 'src/lib/constants/session-payment.constants';

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(data: {
    amount: number;
    currency: Currency;
    expiresAt: Date;
    clientReference?: string;
    projectId: string;
    payerId: string;
  }) {
    return this.prisma.session.create({
      data: {
        amount: data.amount,
        currency: data.currency,
        expiresAt: data.expiresAt,
        clientReference: data.clientReference,
        project: { connect: { id: data.projectId } },
        payer: { connect: { id: data.payerId } },
      },
    });
  }

  async findActiveSession(id: string, includeExpired = false) {
    return this.prisma.session.findUnique({
      where: {
        id,
        expiresAt: includeExpired ? undefined : { gt: new Date() },
        status: { in: SESSION_STATUSES.ACTIVE },
      },
      include: {
        payer: true,
        project: true,
      },
    });
  }

  async findSessionById(id: string) {
    return this.prisma.session.findUnique({
      where: { id },
    });
  }

  async updateSession(
    id: string,
    data: Partial<{
      status: SessionStatus;
      paymentData: string | null;
      successUrl: string;
      failureUrl: string;
    }>,
  ) {
    return this.prisma.session.update({
      where: { id },
      data,
    });
  }
}
