import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetTransactionDto } from './dto/get-transaction.dto';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from 'src/guards/auth/jwt/jwt.guard';

@ApiTags('Project - Transactions')
@Controller(':projectId/transactions')
@UseGuards(JwtAuthGuard())
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Get('')
  @ApiOperation({ summary: 'Lister tous les Transactions' })
  @ApiResponse({ status: 200, description: 'Liste de tous les Transactions' })
  async findAll(
    @Query() query: GetTransactionDto,
    @Param('projectId') projectId: string,
  ) {
    const result = await this.service.findAll(projectId, query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Transactions retrieved successfully',
      ...result,
    };
  }

  @Get('/:id')
  @ApiOperation({ summary: "Details d'une Transaction" })
  @ApiResponse({ status: 200, description: 'Liste de tous les Transactions' })
  async findOne(@Param('id') id: string) {
    const result = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Transactions retrieved successfully',
      result,
    };
  }
}
