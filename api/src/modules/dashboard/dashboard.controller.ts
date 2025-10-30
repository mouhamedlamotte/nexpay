import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService, DashboardDataDto } from './dashboard.service';
import { IsEnum, IsOptional } from 'class-validator';
import { JwtAuthGuard } from 'src/guards/auth/jwt/jwt.guard';

export class DashboardQueryDto {
  @IsOptional()
  @IsEnum(['7d', '30d', '90d', '1d'])
  timeRange?: '1d' | '7d' | '30d' | '90d' = '30d';
}

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get(':projectId')
  @ApiOperation({
    summary: 'Récupérer les données du dashboard',
    description:
      'Retourne toutes les statistiques du dashboard pour le projet actuel',
  })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    enum: ['7d', '30d', '90d', '1d'],
    description: 'Période pour les statistiques (par défaut: 30d)',
  })
  @ApiResponse({
    status: 200,
    description: 'Données du dashboard récupérées avec succès',
    schema: {
      example: {
        stats: {
          totalVolume: 4500000,
          totalTransactions: 245,
          successRate: 96,
          totalFees: 45000,
          growth: {
            volume: 12.5,
            transactions: 8.3,
            successRate: 2.1,
            fees: 10.2,
          },
        },
        providerStats: [
          {
            name: 'Wave',
            code: 'wave',
            logoUrl: 'https://...',
            volume: 3000000,
            transactions: 150,
            successRate: 98,
            percentage: 66.7,
          },
        ],
        quickStats: {
          averageTransaction: 18367.35,
          averageFees: 367.35,
          newPayers: 127,
          topMethods: [
            { name: 'Wave', percentage: 61.2 },
            { name: 'Orange Money', percentage: 32.7 },
            { name: 'Free Money', percentage: 6.1 },
          ],
        },
        recentTransactions: [
          {
            id: 'tx_123',
            reference: 'PAY-2024-001',
            amount: 5000,
            currency: 'XOF',
            status: 'SUCCEEDED',
            provider: { name: 'Wave', code: 'wave' },
            payer: {
              phone: '221771234567',
              email: 'client@example.com',
              name: 'Abdou Diop',
            },
            createdAt: '2025-10-30T10:00:00Z',
            timeAgo: '5 min',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  async getDashboard(
    @Query(ValidationPipe) query: DashboardQueryDto,
    @Param('projectId') projectId: string,
  ): Promise<DashboardDataDto> {
    return this.dashboardService.getDashboardData(
      projectId,
      query.timeRange || '30d',
    );
  }

  @Get('stats/:projectId')
  @ApiOperation({
    summary: 'Récupérer uniquement les statistiques principales',
    description: 'Retourne les KPIs principaux sans les détails',
  })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    enum: ['7d', '30d', '90d'],
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées',
  })
  async getStats(
    @Query('timeRange') timeRange: '7d' | '30d' | '90d' = '30d',
    @Param('projectId') projectId: string,
  ) {
    const data = await this.dashboardService.getDashboardData(
      projectId,
      timeRange,
    );
    return data.stats;
  }

  @Get('providers/:projectId')
  @ApiOperation({
    summary: 'Récupérer les statistiques par provider',
    description: 'Retourne la performance de chaque provider de paiement',
  })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    enum: ['7d', '30d', '90d'],
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des providers récupérées',
  })
  async getProviderStats(
    @Param('projectId') projectId: string,
    @Query('timeRange') timeRange: '7d' | '30d' | '90d' = '30d',
  ) {
    const data = await this.dashboardService.getDashboardData(
      projectId,
      timeRange,
    );
    return data.providerStats;
  }

  @Get('recent-transactions')
  @ApiOperation({
    summary: 'Récupérer les transactions récentes',
    description: 'Retourne les dernières transactions du projet',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions récentes récupérées',
  })
  async getRecentTransactions(@Param('projectId') projectId: string) {
    const data = await this.dashboardService.getDashboardData(projectId, '30d');
    return data.recentTransactions;
  }
}
