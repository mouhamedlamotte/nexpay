import { Injectable } from '@nestjs/common';
import { Currency, Prisma, PrismaService, SessionStatus } from 'src/lib';
import { SESSION_STATUSES } from 'src/lib/constants/session-payment.constants';
import { SessionItemsDto } from './dto/initiate-session-payment.dto';

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
    items: SessionItemsDto[];
  }) {
    const itemsData = data.items?.map((item) => {
      const subtotal = item.unitPrice * item.quantity;
      const taxAmount = item.taxRate ? (subtotal * item.taxRate) / 100 : 0;

      const total = subtotal + taxAmount - (item.discount ?? 0);

      return {
        label: item.label,
        unitPrice: new Prisma.Decimal(item.unitPrice),
        quantity: new Prisma.Decimal(item.quantity),
        subtotal: new Prisma.Decimal(subtotal),
        taxRate: item.taxRate ? new Prisma.Decimal(item.taxRate) : null,
        taxAmount: taxAmount ? new Prisma.Decimal(taxAmount) : null,
        discount: item.discount ? new Prisma.Decimal(item.discount) : null,
        total: new Prisma.Decimal(total),
      };
    });

    return this.prisma.session.create({
      data: {
        amount: data.amount,
        currency: data.currency,
        expiresAt: data.expiresAt,
        clientReference: data.clientReference,
        project: { connect: { id: data.projectId } },
        payer: { connect: { id: data.payerId } },
        items: { create: itemsData },
      },
      include: {
        payer: true,
        project: true,
        items: true,
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
        items: true,
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
