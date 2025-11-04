import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/auth/jwt/jwt.guard';
import { WebhookConfigService } from '../services/webhook-config.service';

@ApiTags('Providers > Settings > Webhook > Orange Money/Wave')
@UseGuards(JwtAuthGuard())
@ApiBearerAuth()
@Controller('/providers/settings/webhook/:code')
export class WebhookConfigController {
  constructor(private readonly service: WebhookConfigService) {}

  @ApiOperation({ summary: 'Reset payment provider webhook config' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully Reset .',
  })
  @HttpCode(HttpStatus.OK)
  @Put('reset')
  async resetSecrets(@Param('code') code: string) {
    const res = await this.service.resetProviderWebhookConfig(code);
    return {
      statusCode: HttpStatus.OK,
      message: 'Le webhook du provider a été mis à jour avec succès.',
      data: res,
    };
  }
}
