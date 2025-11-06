import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CheckoutSessionPaymentDto {
  @ApiPropertyOptional({
    required: false,
    description: 'Additional information about the payment',
    example: {
      key: 'value',
      foo: 'bar',
    },
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    example: 'wave',
    description: 'Payment provider to use',
    required: true,
  })
  @IsString()
  provider: string;

  @ApiPropertyOptional({
    example: 'https://example.com/success',
    description: 'URL to redirect to on successful payment',
    required: false,
  })
  @IsString()
  @IsOptional()
  successUrl?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/error',
    description: 'URL to redirect to on payment error',
    required: false,
  })
  @IsString()
  @IsOptional()
  failureUrl?: string;
}
