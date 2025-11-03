import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export enum WaveWebhookAuthType {
  SHARED_SECRET = 'sharedSecret',
  HMAC = 'hmac',
}

export class ConfigureWaveWebhookDto {
  @ApiProperty({
    enum: WaveWebhookAuthType,
    description: "Type d'authentification pour le webhook Wave",
    example: WaveWebhookAuthType.HMAC,
  })
  @IsEnum(WaveWebhookAuthType)
  @IsNotEmpty()
  authType: WaveWebhookAuthType;

  @ApiProperty({
    description: 'Secret pour signer/valider les webhooks',
    example: 'wave_sn_WHS_xz4m6g8rjs9bshxy05xj4khcvjv7j3hcp4fbpvv6met0zdrjvezg',
    minLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20, { message: 'Le secret doit faire au moins 20 caractères' })
  secret: string;
}

export class UpdateWaveWebhookSecretDto {
  @ApiProperty({
    description: 'Nouveau secret pour le webhook Wave',
    example: 'wave_sn_WHS_new_secret_xyz',
    minLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20, { message: 'Le secret doit faire au moins 20 caractères' })
  secret: string;
}
