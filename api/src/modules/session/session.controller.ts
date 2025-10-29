import {
  Body,
  HttpCode,
  Controller,
  Post,
  HttpStatus,
  Get,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SessionService } from './session.service';
import { InitiateSessionPaymentDto } from './dto/initiate-session-payment.dto';

@Controller('payment/session')
export class SessionController {
  constructor(private readonly service: SessionService) {}

  @Post('/initiate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initiate a new payment session' })
  @ApiResponse({
    status: 201,
    description: 'Payment session successfully initiated',
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
  @ApiOperation({ summary: 'Get a payment session' })
  @ApiResponse({
    status: 201,
    description: 'Payment session successfully initiated',
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
}
