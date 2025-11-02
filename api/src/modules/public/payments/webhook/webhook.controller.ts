import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TransactionStatus, WebhookProvider } from 'src/lib';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WavePaymentStatus, WaveWebhookDto } from './dto/wave-weebhook.dto';
import { WebhookService } from './webhook.service';
import {
  OrangeMoneyPaymentStatus,
  OrangeMoneyWebhookDto,
} from './dto/om-weebhook.dto';
import { WebhookAuthGuard } from 'src/guards/providers-webhook.guard';

@ApiTags('Payment Webhooks')
@Controller('webhook')
@UseGuards(WebhookAuthGuard)
export class WebhookController {
  private logger = new Logger(WebhookController.name);

  constructor(private readonly service: WebhookService) {}

  @Post('wave')
  @WebhookProvider('wave')
  @ApiOperation({ summary: 'Handle Wave webhook callback' })
  @ApiResponse({
    status: 200,
    description: 'Wave webhook processed successfully.',
  })
  @ApiBody({ type: WaveWebhookDto })
  @HttpCode(HttpStatus.OK)
  handleWaveWebhook(@Body() dto: any) {
    this.logger.log('===== Wave webhook received ======');
    this.logger.debug(JSON.stringify(dto, null, 2));

    const payment_status = dto.data?.payment_status;

    const status =
      payment_status === WavePaymentStatus.SUCCEEDED
        ? TransactionStatus.SUCCEEDED
        : TransactionStatus.FAILED;

    return this.service.handleWebhookUpdate({
      reference: dto.data.client_reference,
      status,
    });
  }

  @Post('om')
  @WebhookProvider('om')
  @ApiOperation({ summary: 'Handle Orange Money webhook callback' })
  @ApiResponse({
    status: 200,
    description: 'Orange Money webhook processed successfully.',
  })
  @ApiBody({ type: OrangeMoneyWebhookDto })
  @HttpCode(HttpStatus.OK)
  handleOmWebhook(@Body() dto: any) {
    this.logger.log('===== OM webhook received ======');
    this.logger.debug(JSON.stringify(dto, null, 2));

    let status: TransactionStatus;
    switch (dto.status) {
      case OrangeMoneyPaymentStatus.SUCCESS:
        status = TransactionStatus.SUCCEEDED;
        break;
      case OrangeMoneyPaymentStatus.FAILED:
        status = TransactionStatus.FAILED;
        break;
      default:
        status = TransactionStatus.PENDING;
    }

    return this.service.handleWebhookUpdate({
      reference: dto.reference,
      status,
    });
  }
}
