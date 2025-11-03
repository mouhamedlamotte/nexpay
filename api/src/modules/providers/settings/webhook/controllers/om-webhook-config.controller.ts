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
import { ConfigureOmWebhookDto } from '../dto/configure-om-webhook.dto';
import { OMWebhookConfigService } from '../services/om-webhook-config.service';
import { JwtAuthGuard } from 'src/guards/auth/jwt/jwt.guard';

@ApiTags('Providers > Settings > Webhook > Orange Money')
@UseGuards(JwtAuthGuard())
@ApiBearerAuth()
@Controller('/providers/settings/webhook/om')
export class OMWebhookConfigController {
  private readonly logger = new Logger(OMWebhookConfigController.name);

  constructor(private readonly service: OMWebhookConfigService) {}

  @Post()
  @ApiOperation({
    summary: 'Configurer le webhook Orange Money',
    description:
      'Configure le webhook Orange Money avec le secret. Les autres paramètres sont automatiquement définis (Basic Auth).',
  })
  @ApiResponse({
    status: 201,
    description: 'Webhook Orange Money configuré avec succès.',
  })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({
    status: 404,
    description: 'Provider Orange Money non trouvé.',
  })
  @ApiBody({ type: ConfigureOmWebhookDto })
  @HttpCode(HttpStatus.CREATED)
  async configureOmWebhook(@Body() dto: ConfigureOmWebhookDto) {
    this.logger.log('Configuring Orange Money webhook...');
    const result = await this.service.configureOmWebhook(dto);
    return {
      StatusCode: HttpStatus.CREATED,
      Message: 'Webhook Orange Money configured successfully.',
      data: result,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Récupérer la configuration du webhook Orange Money',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration du webhook Orange Money récupérée.',
  })
  @ApiResponse({ status: 404, description: 'Configuration non trouvée.' })
  async getOmWebhookConfig() {
    const result = await this.service.getOmWebhookConfig();
    return {
      StatusCode: HttpStatus.OK,
      Message: 'Orange Money webhook configuration retrieved successfully.',
      data: result,
    };
  }
}
