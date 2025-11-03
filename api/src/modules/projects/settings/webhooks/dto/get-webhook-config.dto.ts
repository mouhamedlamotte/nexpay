import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/lib';

const validSortBy = ['createdAt', 'updatedAt', 'id', 'url', 'header'];

export class GetWebhookConfigDto extends PaginationDto {
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
}
