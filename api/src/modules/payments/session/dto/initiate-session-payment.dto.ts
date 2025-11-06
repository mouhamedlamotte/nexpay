import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency } from 'src/lib';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class InitiateSessionPaymentDto {
  @ApiProperty({
    example: 5000,
    required: true,
    description: 'Amount to be paid',
  })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    example: Currency.XOF,
    required: false,
    description: 'Currency of the payment',
  })
  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @ApiProperty({
    example: '1f31dfd7-aec8-4adf-84ff-4a9c1981be2a',
    description: 'Entity making the payment',
  })
  @IsString()
  @IsOptional()
  userId: string;

  @ApiProperty({
    example: 'Mouhamed  baba',
    description: 'Name of the entity making the payment',
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    example: '+22177123456',
    description: 'Phone number of the entity making the payment',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: 'exemple@email.com',
    description: 'Entity email making the payment',
  })
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty({
    example: 'ref-1f31dfd7-aec8-4adf-84ff-4a9c1981be2a',
    description: 'Client reference for the payment',
  })
  @IsString()
  @IsOptional()
  client_reference?: string;

  @ApiProperty({
    example: '1f31dfd7-aec8-4adf-84ff-4a9c1981be2a',
    description: 'ID of the project making the payment',
  })
  @IsString()
  projectId: string;

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
