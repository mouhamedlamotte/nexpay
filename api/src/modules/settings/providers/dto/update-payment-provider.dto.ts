import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject } from 'class-validator';

export class UpdatePaymentProviderDto {
  @ApiProperty({
    example: 'prov_123456',
    description: 'ID du provider (référence vers PaymentProvider)',
  })
  @IsString()
  @IsNotEmpty()
  providerId: string;

  @ApiProperty({
    example: { client_id: 'abc', client_secret: 'xyz' },
    description: 'Secrets spécifiques à l’organisation pour ce provider',
  })
  @IsObject()
  @IsNotEmpty()
  secrets: Record<string, string>;
}
