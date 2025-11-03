import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrangeMoneyPaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export class OrangeMoneyCustomerDto {
  @ApiProperty({ example: 'MSISDN' })
  @IsString()
  idType: string;

  @ApiProperty({ example: '770934213' })
  @IsString()
  id: string;
}

export class OrangeMoneyAmountDto {
  @ApiProperty({ example: 10 })
  @IsNumber()
  value: number;

  @ApiProperty({ example: 'XOF' })
  @IsString()
  unit: string;
}

export class OrangeMoneyWebhookDto {
  @ApiProperty({ type: OrangeMoneyAmountDto })
  @ValidateNested()
  @Type(() => OrangeMoneyAmountDto)
  amount: OrangeMoneyAmountDto;

  @ApiProperty({ example: 'WER1329' })
  @IsString()
  reference: string;

  @ApiProperty({ example: 'MP250827.1838.C30884' })
  @IsString()
  transactionId: string;

  @ApiProperty({
    enum: OrangeMoneyPaymentStatus,
    example: OrangeMoneyPaymentStatus.SUCCESS,
  })
  @IsString()
  status: OrangeMoneyPaymentStatus;
}
