import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentProviderService } from './payment-provider.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdatePaymentProviderDto } from './dto/update-payment-provider.dto';
import { GetPaymentProviderDto } from './dto/get-payment-provider.dto';
import { JwtAuthGuard } from 'src/guards/auth/jwt/jwt.guard';

@ApiTags('Settings - Payment Providers')
@Controller('/settings/providers')
@UseGuards(JwtAuthGuard())
export class PaymentProviderController {
  constructor(private readonly service: PaymentProviderService) {}

  // UPDATE
  @ApiOperation({ summary: 'Update payment provider' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
  })
  @ApiBody({ type: UpdatePaymentProviderDto })
  @HttpCode(HttpStatus.OK)
  @Put('')
  async update(@Body() dto: UpdatePaymentProviderDto) {
    const res = await this.service.update(dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Le payment provider a été mis à jour avec succès.',
      data: res,
    };
  }

  // UPDATE
  @ApiOperation({ summary: 'Toggle payment provider' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully Toggled.',
  })
  @HttpCode(HttpStatus.OK)
  @Delete('/:providerId')
  async toggle(
    @Param('providerId') providerId: string,
    @Body('isActive') isActive: boolean,
  ) {
    const res = await this.service.toggle(providerId, isActive);
    return {
      statusCode: HttpStatus.OK,
      message: 'Le payment provider a été mis à jour avec succès.',
      data: res,
    };
  }

  // GET ONE
  @ApiOperation({ summary: 'Get one payment provider by code' })
  @ApiResponse({
    status: 200,
    description: 'Returns one payment provider.',
  })
  @HttpCode(HttpStatus.OK)
  @Get('/code/:code')
  async getByCode(@Param('code') code: string) {
    const res = await this.service.getProviderByCode(code);
    return {
      statusCode: HttpStatus.OK,
      message: 'Le provider a été récupéré avec succès.',
      data: res,
    };
  }

  // GET LIST pour les providers d’une org
  @ApiOperation({ summary: 'List all payment providers' })
  @ApiResponse({
    status: 200,
    description: 'Returns all payment providers linked to an.',
  })
  @HttpCode(HttpStatus.OK)
  @Get('')
  async list(@Query() query: GetPaymentProviderDto) {
    const result = await this.service.findAll(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Liste des payment providers récupérée avec succès.',
      ...result,
    };
  }
}
