import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdatePaymentProviderSecretsDto } from './dto/update-payment-provider.dto';
import { GetPaymentProviderDto } from './dto/get-payment-provider.dto';
import { JwtAuthGuard } from 'src/guards/auth/jwt/jwt.guard';

@ApiTags('Providers')
@Controller('/providers')
@UseGuards(JwtAuthGuard())
@ApiBearerAuth()
export class ProvidersController {
  constructor(private readonly service: ProvidersService) {}

  // UPDATE
  @ApiOperation({ summary: 'Toggle payment provider' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully Toggled.',
  })
  @HttpCode(HttpStatus.OK)
  @Put('/:code/toggle')
  async toggle(
    @Param('code') code: string,
    @Body('isActive') isActive: boolean,
  ) {
    const res = await this.service.toggle(code, isActive);
    return {
      statusCode: HttpStatus.OK,
      message: 'Le payment provider a été mis à jour avec succès.',
      data: res,
    };
  }
  // UPDATE
  @ApiOperation({ summary: 'Update payment provider secrets' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
  })
  @ApiBody({ type: UpdatePaymentProviderSecretsDto })
  @HttpCode(HttpStatus.OK)
  @Put('/:code/secrets')
  async update(
    @Body() dto: UpdatePaymentProviderSecretsDto,
    @Param('code') code: string,
  ) {
    const res = await this.service.update(code, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Le payment provider a été mis à jour avec succès.',
      data: res,
    };
  }

  @ApiOperation({ summary: 'Reset payment provider secrets' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully Reset .',
  })
  @ApiBody({ type: UpdatePaymentProviderSecretsDto })
  @HttpCode(HttpStatus.OK)
  @Put('/:code/secrets/reset')
  async resetSecrets(@Param('code') code: string) {
    const res = await this.service.resetSecrets(code);
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
  @Get('/:code')
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
