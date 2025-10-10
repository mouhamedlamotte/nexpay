import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/lib/dto/pagination.dto';

const validSortBy = [
  'createdAt',
  'updatedAt',
  'provider.name',
  'provider.code',
];

export class GetPaymentProviderDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: validSortBy,
    required: false,
  })
  @IsOptional()
  @IsEnum(validSortBy)
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    example: 'true',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
