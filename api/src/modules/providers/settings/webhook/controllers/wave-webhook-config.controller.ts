import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WaveWebhookConfigService } from '../services/wave-webhook-config.service';
import { ConfigureWaveWebhookDto } from '../dto/configure-wave-webhook.dto';
import { JwtAuthGuard } from 'src/guards/auth/jwt/jwt.guard';

@ApiTags('Providers > Settings > Webhook > Wave')
@Controller('/providers/settings/webhook/wave')
@UseGuards(JwtAuthGuard())
@ApiBearerAuth()
export class WaveWebhookConfigController {
  private readonly logger = new Logger(WaveWebhookConfigController.name);

  constructor(private readonly service: WaveWebhookConfigService) {}

  @Post()
  @ApiOperation({
    summary: 'Configurer le webhook Wave',
    description:
      "Configure le webhook Wave avec le type d'auth et le secret. Les autres paramètres sont automatiquement définis.",
  })
  @ApiResponse({
    status: 201,
    description: 'Webhook Wave configuré avec succès.',
  })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 404, description: 'Provider Wave non trouvé.' })
  @ApiBody({ type: ConfigureWaveWebhookDto })
  @HttpCode(HttpStatus.CREATED)
  async configureWaveWebhook(@Body() dto: ConfigureWaveWebhookDto) {
    this.logger.log('Configuring Wave webhook...');
    const result = await this.service.configureWaveWebhook(dto);
    return {
      StatusCode: HttpStatus.CREATED,
      Message:
        'Webhook Wave configured successfully., be sure to add the webhook url and the webhook secret to your Wave account.',
      data: result,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Récupérer la configuration du webhook Wave',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration du webhook Wave récupérée.',
  })
  @ApiResponse({ status: 404, description: 'Configuration non trouvée.' })
  async getWaveWebhookConfig() {
    const result = await this.service.getWaveWebhookConfig();
    return {
      StatusCode: HttpStatus.OK,
      Message: 'Wave webhook configuration retrieved successfully.',
      data: result,
    };
  }
}
