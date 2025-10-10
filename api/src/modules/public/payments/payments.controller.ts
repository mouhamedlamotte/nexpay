import { Body, HttpCode, Controller, Post, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('Payment')
@Controller('payment')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post('/initiate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initiate a new payment' })
  @ApiResponse({ status: 201, description: 'Payment successfully initiated' })
  @ApiResponse({ status: 404, description: 'Provider or service not found' })
  async initiatePayment(@Body() data: InitiatePaymentDto) {
    return await this.service.initiatePayment(data);
  }
}
