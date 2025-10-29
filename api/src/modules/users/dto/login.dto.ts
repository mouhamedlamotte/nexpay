import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@weg.com',
    description: 'Adresse email de l’admin',
  })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({
    example: 'weg@taxi2k25!admin',
    description: 'Mot de passe de l’admin',
  })
  @IsString({ message: 'Le mot de passe doit être une chaîne' })
  @MinLength(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères',
  })
  password: string;
}
