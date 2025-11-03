import {
  Body,
  HttpCode,
  Controller,
  Post,
  HttpStatus,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SessionPayemtService } from './session.service';
import { InitiateSessionPaymentDto } from './dto/initiate-session-payment.dto';
import { CheckoutSessionPaymentDto } from './dto/CheckoutSessionPaymentDto';
import {
  SessionPaymentCheckoutResponse,
  SessionPaymentDetailsResponse,
  SessionPaymentResponse,
} from './responses/session-payment.reponse';
import {
  ApiKeyGuard,
  ApiKeyPermission,
  RequireApiKey,
} from 'src/guards/api-key.guard';

@Controller('payment/session')
@UseGuards(ApiKeyGuard)
export class SessionPaymentController {
  constructor(private readonly service: SessionPayemtService) {}

  @Post('/initiate')
  @HttpCode(HttpStatus.CREATED)
  @RequireApiKey(ApiKeyPermission.WRITE)
  @ApiOperation({ summary: 'Initiate a new payment session' })
  @ApiResponse({
    status: 201,
    description: 'Payment session successfully initiated',
    example: SessionPaymentResponse,
  })
  @ApiResponse({ status: 404, description: 'Provider or service not found' })
  async initiateSessionPayment(@Body() data: InitiateSessionPaymentDto) {
    const res = await this.service.initiateSessionPayment(data);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Payment session successfully initiated',
      data: res,
    };
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @RequireApiKey(ApiKeyPermission.READ, ApiKeyPermission.WRITE)
  @ApiOperation({ summary: 'Get a payment session' })
  @ApiResponse({
    status: 201,
    description: 'Payment session successfully initiated',
    example: SessionPaymentDetailsResponse,
  })
  @ApiResponse({ status: 404, description: 'Provider or service not found' })
  async getSession(@Param('id') id: string) {
    const res = await this.service.getSession(id, false);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payment session successfully initiated',
      data: res,
    };
  }

  @Post('/:id/checkout')
  @HttpCode(HttpStatus.OK)
  @RequireApiKey(ApiKeyPermission.READ, ApiKeyPermission.WRITE)
  @ApiOperation({ summary: 'Checkout a payment session' })
  @ApiResponse({
    status: 201,
    description: 'Payment data successfully fetched',
    example: SessionPaymentCheckoutResponse,
  })
  @ApiResponse({ status: 404, description: 'Provider or service not found' })
  async checkoutSession(
    @Param('id') id: string,
    @Body() data: CheckoutSessionPaymentDto,
  ) {
    const res = await this.service.checkoutSessionPayment(id, data);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payment data successfully fetched',
      data: res,
    };
  }
}
