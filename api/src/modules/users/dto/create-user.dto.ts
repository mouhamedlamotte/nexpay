import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsBoolean,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Mouhameth',
    description: 'Prénom de l’admin',
  })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  firstName: string;

  @ApiProperty({
    example: 'Lamotte',
    description: 'Nom de famille de l’admin',
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  lastName: string;

  @ApiProperty({
    example: 'passer123',
    description: 'Passe du user',
  })
  @IsString()
  @MinLength(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères',
  })
  password: string;

  @ApiProperty({
    example: 'admin@nexcom.com',
    description: 'Adresse email unique de l’admin',
  })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({
    example: false,
    description: 'Est-ce un super user',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isSuperUser?: boolean;
}
