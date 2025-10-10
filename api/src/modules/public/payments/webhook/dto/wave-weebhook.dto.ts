import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum WavePaymentStatus {
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

export enum WaveCheckoutStatus {
  COMPLETE = 'complete',
}

export enum WaveEventType {
  CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed',
  CHECKOUT_SESSION_PAYMENT_FAILED = 'checkout.session.payment_failed',
}

export class WaveWebhookDataDto {
  @ApiProperty({ example: 'cos-18qq25rgr100a' })
  @IsString()
  id: string;

  @ApiProperty({
    example: '1000',
    description: 'Montant en plus petite unité (ex: centimes)',
  })
  @IsString()
  amount: string;

  @ApiProperty({ example: '1f31dfd7-aec8-4adf-84ff-4a9c1981be2a' })
  @IsString()
  client_reference: string;

  @ApiProperty({
    enum: WavePaymentStatus,
    example: WavePaymentStatus.SUCCEEDED,
  })
  @IsEnum(WavePaymentStatus)
  payment_status: WavePaymentStatus;
}

export class WaveWebhookDto {
  @ApiProperty({ example: 'EV_QvEZuDSQbLdI' })
  @IsString()
  id: string;

  @ApiProperty({
    enum: WaveEventType,
    example: WaveEventType.CHECKOUT_SESSION_COMPLETED,
  })
  @IsEnum(WaveEventType)
  type: WaveEventType;

  @ApiProperty({ type: WaveWebhookDataDto })
  @ValidateNested()
  @Type(() => WaveWebhookDataDto)
  data: WaveWebhookDataDto;
}
