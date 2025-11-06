import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmpty, IsOptional, IsUrl } from 'class-validator';

export class CallBacksDto {
  @ApiPropertyOptional({
    example: 'https://example.com/success',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  @IsEmpty()
  successUrl: string;
  @ApiPropertyOptional({
    example: 'https://example.com/failure',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  @IsEmpty()
  failureUrl: string;

  @ApiPropertyOptional({
    example: 'https://example.com/cancel',
    required: false,
  })
  @IsUrl()
  @IsEmpty()
  @IsOptional()
  cancelUrl: string;
}
