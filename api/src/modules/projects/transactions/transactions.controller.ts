import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetTransactionDto } from './dto/get-transaction.dto';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from 'src/guards/auth/jwt/jwt.guard';

@ApiTags('Project > Transactions')
@Controller('projects/:projectId/transactions')
@UseGuards(JwtAuthGuard())
@ApiBearerAuth()
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
