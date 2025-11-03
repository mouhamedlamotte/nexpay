import {
  Body,
  HttpCode,
  Controller,
  Post,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { paymentResponse } from './responses/payment.reponse';
import {
  ApiKeyGuard,
  ApiKeyPermission,
  RequireApiKey,
} from 'src/guards/api-key.guard';

@ApiTags('Payment')
@Controller('payment')
@ApiSecurity('api_key', ['x-api-key'])
@UseGuards(ApiKeyGuard)
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post('/initiate')
  @HttpCode(HttpStatus.CREATED)
  @RequireApiKey(ApiKeyPermission.WRITE)
  @ApiOperation({ summary: 'Initiate a new payment' })
  @ApiResponse({
    status: 201,
    description: 'Payment successfully initiated',
    example: paymentResponse,
  })
  @ApiResponse({ status: 404, description: 'Provider or service not found' })
  async initiatePayment(@Body() data: InitiatePaymentDto) {
    const res = await this.service.initiatePayment(data);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Payment successfully initiated',
      data: res,
    };
  }
}
