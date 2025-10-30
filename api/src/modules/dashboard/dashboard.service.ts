import { Injectable } from '@nestjs/common';
import { LoggerService, PrismaService } from 'src/lib';
import { Prisma, TransactionStatus, TransactionType } from '@prisma/client';

// DTOs
export interface DashboardStatsDto {
  totalVolume: number;
  totalTransactions: number;
  successRate: number;
  growth: {
    volume: number;
    transactions: number;
    successRate: number;
  };
}

export interface ProviderStatsDto {
  name: string;
  code: string;
  logoUrl: string | null;
  volume: number;
  transactions: number;
  successRate: number;
  percentage: number;
}

export interface RecentTransactionDto {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  provider: {
    name: string;
    code: string;
  };
  payer: {
    phone: string | null;
    email: string | null;
    name: string | null;
  } | null;
  createdAt: Date;
  timeAgo: string;
}

export interface QuickStatsDto {
  averageTransaction: number;
  newPayers: number;
  topMethods: Array<{
    name: string;
    percentage: number;
  }>;
}

export interface DashboardDataDto {
  stats: DashboardStatsDto;
  providerStats: ProviderStatsDto[];
  quickStats: QuickStatsDto;
  recentTransactions: RecentTransactionDto[];
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(DashboardService.name);
  }

  /**
   * Récupère toutes les données du dashboard pour un projet
   */
  async getDashboardData(
    projectId: string,
    timeRange: '7d' | '30d' | '90d' | '1d' = '30d',
  ): Promise<DashboardDataDto> {
    try {
      this.logger.log(
        `Fetching dashboard data for project ${projectId} (${timeRange})`,
      );

      const { startDate, previousStartDate } = this.getDateRanges(timeRange);

      const [stats, providerStats, quickStats, recentTransactions] =
        await Promise.all([
          this.getStats(projectId, startDate, previousStartDate),
          this.getProviderStats(projectId, startDate),
          this.getQuickStats(projectId, startDate),
          this.getRecentTransactions(projectId, 5),
        ]);

      return {
        stats,
        providerStats,
        quickStats,
        recentTransactions,
      };
    } catch (error) {
      this.logger.error('Error fetching dashboard data', error);
      throw error;
    }
  }

  /**
   * Calcule les statistiques principales
   */
  private async getStats(
    projectId: string,
    startDate: Date,
    previousStartDate: Date,
  ): Promise<DashboardStatsDto> {
    const whereClause: Prisma.TransactionWhereInput = {
      projectId,
      type: TransactionType.PAYMENT,
      createdAt: { gte: startDate },
    };

    const previousWhereClause: Prisma.TransactionWhereInput = {
      projectId,
      type: TransactionType.PAYMENT,
      createdAt: {
        gte: previousStartDate,
        lt: startDate,
      },
    };

    // Période actuelle
    const [currentTransactions, currentTotal] = await Promise.all([
      this.prisma.transaction.count({
        where: whereClause,
      }),
      this.prisma.transaction.aggregate({
        where: {
          ...whereClause,
          status: TransactionStatus.SUCCEEDED,
        },
        _sum: { amount: true },
      }),
    ]);

    const currentSuccess = await this.prisma.transaction.count({
      where: {
        ...whereClause,
        status: TransactionStatus.SUCCEEDED,
      },
    });

    // Période précédente
    const [previousTransactions, previousTotal] = await Promise.all([
      this.prisma.transaction.count({
        where: previousWhereClause,
      }),
      this.prisma.transaction.aggregate({
        where: previousWhereClause,
        _sum: { amount: true },
      }),
    ]);

    const previousSuccess = await this.prisma.transaction.count({
      where: {
        ...previousWhereClause,
        status: TransactionStatus.SUCCEEDED,
      },
    });

    // Calculs
    const totalVolume = Number(currentTotal._sum.amount || 0);
    const previousVolume = Number(previousTotal._sum.amount || 0);
    const successRate =
      currentTransactions > 0
        ? (currentSuccess / currentTransactions) * 100
        : 0;
    const previousSuccessRate =
      previousTransactions > 0
        ? (previousSuccess / previousTransactions) * 100
        : 0;

    // Croissance
    const volumeGrowth = this.calculateGrowth(totalVolume, previousVolume);
    const transactionsGrowth = this.calculateGrowth(
      currentTransactions,
      previousTransactions,
    );
    const successRateGrowth = this.calculateGrowth(
      successRate,
      previousSuccessRate,
    );

    return {
      totalVolume,
      totalTransactions: currentTransactions,
      successRate: Math.round(successRate * 10) / 10,
      growth: {
        volume: volumeGrowth,
        transactions: transactionsGrowth,
        successRate: successRateGrowth,
      },
    };
  }

  /**
   * Statistiques par provider
   */
  private async getProviderStats(
    projectId: string,
    startDate: Date,
  ): Promise<ProviderStatsDto[]> {
    const stats = await this.prisma.transaction.groupBy({
      by: ['providerId'],
      where: {
        projectId,
        type: TransactionType.PAYMENT,
        createdAt: { gte: startDate },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Récupérer les infos des providers
    const providerIds = stats.map((s) => s.providerId);
    const providers = await this.prisma.paymentProvider.findMany({
      where: { id: { in: providerIds } },
      select: { id: true, name: true, code: true, logoUrl: true },
    });

    const providerMap = new Map(providers.map((p) => [p.id, p]));

    // Calculer le taux de succès par provider
    const successCounts = await Promise.all(
      providerIds.map((providerId) =>
        this.prisma.transaction.count({
          where: {
            projectId,
            providerId,
            status: TransactionStatus.SUCCEEDED,
            createdAt: { gte: startDate },
          },
        }),
      ),
    );

    const totalVolume = stats.reduce(
      (sum, s) => sum + Number(s._sum.amount || 0),
      0,
    );

    return stats
      .map((stat, index) => {
        const provider = providerMap.get(stat.providerId);
        if (!provider) return null;

        const volume = Number(stat._sum.amount || 0);
        const transactions = stat._count.id;
        const successCount = successCounts[index];
        const successRate =
          transactions > 0 ? (successCount / transactions) * 100 : 0;

        return {
          name: provider.name,
          code: provider.code,
          logoUrl: provider.logoUrl,
          volume,
          transactions,
          successRate: Math.round(successRate * 10) / 10,
          percentage: totalVolume > 0 ? (volume / totalVolume) * 100 : 0,
        };
      })
      .filter((s) => s !== null)
      .sort((a, b) => b.volume - a.volume);
  }

  /**
   * Statistiques rapides
   */
  private async getQuickStats(
    projectId: string,
    startDate: Date,
  ): Promise<QuickStatsDto> {
    const whereClause: Prisma.TransactionWhereInput = {
      projectId,
      type: TransactionType.PAYMENT,
      createdAt: { gte: startDate },
    };

    // Montant moyen et total
    const [totalData, transactionCount] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          ...whereClause,
          status: TransactionStatus.SUCCEEDED,
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({ where: whereClause }),
    ]);

    const totalVolume = Number(totalData._sum.amount || 0);
    const averageTransaction =
      transactionCount > 0 ? totalVolume / transactionCount : 0;

    // Nouveaux payeurs
    const newPayers = await this.prisma.payer.count({
      where: {
        transactions: {
          some: {
            projectId,
            createdAt: { gte: startDate },
          },
        },
      },
    });

    // Top méthodes
    const providerStats = await this.prisma.transaction.groupBy({
      by: ['providerId'],
      where: whereClause,
      _count: { id: true },
    });

    const providers = await this.prisma.paymentProvider.findMany({
      where: { id: { in: providerStats.map((s) => s.providerId) } },
      select: { id: true, name: true },
    });

    const providerMap = new Map(providers.map((p) => [p.id, p.name]));
    const totalTransactions = providerStats.reduce(
      (sum, s) => sum + s._count.id,
      0,
    );

    const topMethods = providerStats
      .map((stat) => ({
        name: providerMap.get(stat.providerId) || 'Unknown',
        percentage:
          totalTransactions > 0
            ? (stat._count.id / totalTransactions) * 100
            : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);

    return {
      averageTransaction,
      newPayers,
      topMethods,
    };
  }

  /**
   * Transactions récentes
   */
  private async getRecentTransactions(
    projectId: string,
    limit: number = 5,
  ): Promise<RecentTransactionDto[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        projectId,
        type: TransactionType.PAYMENT,
      },
      include: {
        provider: {
          select: { name: true, code: true },
        },
        payer: {
          select: { phone: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transactions.map((tx) => ({
      id: tx.id,
      reference: tx.reference,
      amount: Number(tx.amount),
      currency: tx.currency,
      status: tx.status,
      provider: {
        name: tx.provider.name,
        code: tx.provider.code,
      },
      payer: tx.payer,
      createdAt: tx.createdAt,
      timeAgo: this.getTimeAgo(tx.createdAt),
    }));
  }

  /**
   * Calcule la croissance en pourcentage
   */
  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    const growth = ((current - previous) / previous) * 100;
    return Math.round(growth * 10) / 10;
  }

  /**
   * Calcule les plages de dates
   */
  private getDateRanges(timeRange: '7d' | '30d' | '90d' | '1d'): {
    startDate: Date;
    previousStartDate: Date;
  } {
    const now = new Date();
    const days =
      timeRange === '7d'
        ? 7
        : timeRange === '30d'
          ? 30
          : timeRange === '90d'
            ? 90
            : 1;

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    return { startDate, previousStartDate };
  }

  /**
   * Formate le temps écoulé
   */
  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours}h`;
    return `${days}j`;
  }

  /**
   * Statistiques globales (tous les projets)
   */
  async getGlobalStats(
    timeRange: '7d' | '30d' | '90d' = '30d',
  ): Promise<DashboardStatsDto> {
    const { startDate, previousStartDate } = this.getDateRanges(timeRange);

    // Récupérer tous les projets de l'utilisateur
    const projects = await this.prisma.project.findMany({
      select: { id: true },
    });

    const projectIds = projects.map((p) => p.id);

    if (projectIds.length === 0) {
      return {
        totalVolume: 0,
        totalTransactions: 0,
        successRate: 0,
        growth: {
          volume: 0,
          transactions: 0,
          successRate: 0,
        },
      };
    }

    return this.getStats(projectIds[0], startDate, previousStartDate);
  }
}
