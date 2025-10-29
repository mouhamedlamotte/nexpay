import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CallbacksService } from './callbacks.service';
import { CallBacksDto } from './dto/callbacks.dto';
import { JwtAuthGuard } from 'src/guards/auth/jwt/jwt.guard';

@ApiTags('Settings - Redirects Callbacks')
@Controller(':projectId/settings/redirects')
@UseGuards(JwtAuthGuard())
export class CallbacksController {
  constructor(private readonly service: CallbacksService) {}

  // CREATE
  @ApiOperation({ summary: 'Create project redirect config' })
  @ApiResponse({
    status: 201,
    description: 'The redirect configuration has been successfully created.',
  })
  @ApiBody({ type: CallBacksDto })
  @HttpCode(HttpStatus.CREATED)
  @Post('')
  async create(
    @Body() dto: CallBacksDto,
    @Param('projectId') projectId: string,
  ) {
    const res = await this.service.create(projectId, dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'La configuration de redirection a été créée avec succès.',
      data: res,
    };
  }

  // UPDATE
  @ApiOperation({ summary: 'Update project redirect config' })
  @ApiResponse({
    status: 200,
    description: 'The redirect configuration has been successfully updated.',
  })
  @ApiBody({ type: CallBacksDto })
  @HttpCode(HttpStatus.OK)
  @Put('')
  async update(
    @Body() dto: CallBacksDto,
    @Param('projectId') projectId: string,
  ) {
    const res = await this.service.update(projectId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'La configuration de redirection a été mise à jour avec succès.',
      data: res,
    };
  }

  // GET ONE
  @ApiOperation({ summary: 'Get project redirect config' })
  @ApiResponse({
    status: 200,
    description: 'Returns the redirect configuration for the project.',
  })
  @HttpCode(HttpStatus.OK)
  @Get('')
  async findOne(@Param('projectId') projectId: string) {
    const res = await this.service.findOne(projectId);
    return {
      statusCode: HttpStatus.OK,
      message: 'La configuration de redirection a été récupérée avec succès.',
      data: res,
    };
  }
}
