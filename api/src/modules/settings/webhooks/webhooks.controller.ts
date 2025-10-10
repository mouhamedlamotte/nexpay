import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { CreateWebhooksConfigDto } from './dto/create-webhooks-config.dto';
import { UpdateWebhooksConfigDto } from './dto/update-webhooks-config.dto';
import { GetWebhookConfigDto } from './dto/get-webhook-config.dto';

@ApiTags('Settings - Webhooks urls')
@Controller(':projectId/settings/webhooks')
export class WebhooksController {
  constructor(private readonly service: WebhooksService) {}

  // CREATE
  @ApiOperation({ summary: 'Create project webhook config' })
  @ApiResponse({
    status: 201,
    description: 'The webhook configuration has been successfully created.',
  })
  @ApiBody({ type: CreateWebhooksConfigDto })
  @HttpCode(HttpStatus.CREATED)
  @Post('')
  async create(
    @Body() dto: CreateWebhooksConfigDto,
    @Param('projectId') projectId: string,
  ) {
    const res = await this.service.create(projectId, dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'La configuration webhook a été créée avec succès.',
      data: res,
    };
  }

  // UPDATE
  @ApiOperation({ summary: 'Update project webhook config' })
  @ApiResponse({
    status: 200,
    description: 'The webhook configuration has been successfully updated.',
  })
  @ApiBody({ type: UpdateWebhooksConfigDto })
  @HttpCode(HttpStatus.OK)
  @Put('/:id')
  async update(
    @Body() dto: UpdateWebhooksConfigDto,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    const res = await this.service.update(projectId, id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'La configuration webhook a été mise à jour avec succès.',
      data: res,
    };
  }

  // GET ONE
  @ApiOperation({ summary: 'Get one webhook config by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns one webhook configuration.',
  })
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  async findOne(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    const res = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'La configuration webhook a été récupérée avec succès.',
      data: res,
    };
  }

  // GET LIST
  @ApiOperation({ summary: 'List all project webhook configs' })
  @ApiResponse({
    status: 200,
    description: 'Returns all webhook configurations linked to an project.',
  })
  @HttpCode(HttpStatus.OK)
  @Get('')
  async list(
    @Param('projectId') projectId: string,
    @Query() query: GetWebhookConfigDto,
  ) {
    const result = await this.service.findAll(projectId, query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Liste des webhooks récupérée avec succès.',
      ...result,
    };
  }
}
