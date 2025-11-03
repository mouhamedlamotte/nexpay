import { PaginationDto } from 'src/lib/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { Currency, TransactionStatus } from 'src/lib';

const validSortBy = [
  'createdAt',
  'updatedAt',
  'id',
  'amount',
  'currency',
  'status',
  'expiresAt',
  'resolvedAt',
  'reference',
];

export class GetTransactionDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: validSortBy,
    required: false,
  })
  @IsOptional()
  @IsEnum(validSortBy, {
    message: `sortBy must be one of ${validSortBy.join(', ')}`,
  })
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par devise',
    enum: Currency,
    example: 'XOF',
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional({
    description: 'Filtrer par statut de transaction',
    enum: TransactionStatus,
    example: 'SUCCESS',
  })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiPropertyOptional({
    description: 'Filtrer par référence de transaction',
    example: 'TRX123456',
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par identifiant de transaction du provider',
    example: 'PROV123456',
  })
  @IsOptional()
  @IsString()
  providerTransactionId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par date de création minimum',
    example: '2025-08-20T00:00:00.000Z',
  })
  @IsOptional()
  createdAfter?: Date;

  @ApiPropertyOptional({
    description: 'Filtrer par date de création maximum',
    example: '2025-08-22T23:59:59.999Z',
  })
  @IsOptional()
  createdBefore?: Date;

  @ApiPropertyOptional({
    description: 'Champ de recherche',
    example: 'Wave',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
