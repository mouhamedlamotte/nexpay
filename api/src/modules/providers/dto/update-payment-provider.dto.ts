import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';

export class UpdatePaymentProviderSecretsDto {
  @ApiProperty({
    example: { client_id: 'abc', client_secret: 'xyz' },
    description: 'Secrets spécifiques à l’organisation pour ce provider',
  })
  @IsObject()
  @IsNotEmpty()
  secrets: Record<string, string>;
}
