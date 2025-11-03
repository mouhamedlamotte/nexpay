import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class ConfigureOmWebhookDto {
  @ApiProperty({
    description: 'Secret (apiKey) pour le webhook Orange Money',
    example: 'om_webhook_secret_abc123xyz',
    minLength: 20,
  })
  @IsString()
  @IsOptional()
  @MinLength(20, { message: 'Le secret doit faire au moins 20 caractères' })
  secret: string;

  @ApiProperty({
    description:
      'Configurer automatiquement le webhook dans orange money Orange Money, if false, secret must be provided',
    example: true,
  })
  @IsBoolean()
  autoConfigure: boolean;
}

export class UpdateOmWebhookSecretDto {
  @ApiProperty({
    description: 'Nouveau secret pour le webhook Orange Money',
    example: 'om_webhook_new_secret_xyz',
    minLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20, { message: 'Le secret doit faire au moins 20 caractères' })
  secret: string;
}
