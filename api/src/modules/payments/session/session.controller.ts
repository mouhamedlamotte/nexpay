import {
  Body,
  HttpCode,
  Controller,
  Post,
  HttpStatus,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
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
import { SessionPaymentService } from './session.service';
import { JwtAuthGuard } from 'src/guards/auth';
import { TestSessionPaymentDto } from './dto/test-session-payment.dto';

@ApiTags('Payment > Session')
@Controller('payment/session')
@ApiSecurity('api_key', ['x-api-key'])
export class SessionPaymentController {
  constructor(private readonly service: SessionPaymentService) {}

  @Post('/initiate')
  @HttpCode(HttpStatus.CREATED)
  @RequireApiKey(ApiKeyPermission.WRITE)
  @UseGuards(ApiKeyGuard)
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
  @UseGuards(ApiKeyGuard)
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
  @UseGuards(ApiKeyGuard)
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

  @Post('/:id/status')
  @HttpCode(HttpStatus.OK)
  @RequireApiKey(ApiKeyPermission.READ, ApiKeyPermission.WRITE)
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Check status of a payment session' })
  @ApiResponse({
    status: 200,
    description: 'Payment status data successfully fetched',
    example: {
      sessionId: 'cmhdpuj6m00069usa10370ldr',
      status: 'opened',
      redirectUrl: 'http://l........../checkout/success',
    },
  })
  @ApiResponse({ status: 404, description: 'Provider or service not found' })
  async waitPaymentStatus(@Param('id') id: string) {
    const res = await this.service.waitSessionPaymentStatus(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payment status data successfully fetched',
      data: res,
    };
  }

  @ApiOperation({ summary: 'Test a payment provider' })
  @ApiResponse({
    status: 200,
    description: 'The test has been successfully done.',
  })
  @ApiBody({ type: TestSessionPaymentDto })
  @HttpCode(HttpStatus.OK)
  @Post('providers/:code/test')
  @UseGuards(JwtAuthGuard())
  async testSecret(
    @Body() dto: TestSessionPaymentDto,
    @Param('code') code: string,
    @Req() req: any,
  ) {
    const res = await this.service.testSessionPayment(req.user.id, code, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Le test est passé avec succès.',
      data: res,
    };
  }
}
