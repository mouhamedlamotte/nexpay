import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUrl } from 'class-validator';

export class CallBacksDto {
  @ApiPropertyOptional({
    example: 'https://example.com/success',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  successUrl: string;
  @ApiPropertyOptional({
    example: 'https://example.com/failure',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  failureUrl: string;

  @ApiPropertyOptional({
    example: 'https://example.com/cancel',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  cancelUrl: string;
}
