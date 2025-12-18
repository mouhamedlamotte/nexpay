import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency } from 'src/lib';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SessionItemsDto {
  @ApiProperty({
    example: 'Item 1',
    description: 'Label or name of the item',
  })
  @IsString()
  label: string;

  @ApiProperty({
    example: 5000,
    description: 'Unit price of the item (in smallest currency unit)',
  })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({
    example: 1,
    description: 'Quantity of the item',
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    example: 18,
    description: 'Tax rate in percentage (e.g. 18 for 18%)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiPropertyOptional({
    example: 500,
    description: 'Discount amount applied to the item',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

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

  @ApiPropertyOptional({
    description: 'List of items to be displayed and paid',
    type: [SessionItemsDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionItemsDto)
  items?: SessionItemsDto[];
}
