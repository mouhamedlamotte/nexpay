import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsBoolean, IsOptional } from 'class-validator';

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
    example: 'admin@nexcom.com',
    description: 'Adresse email unique de l’admin',
  })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({
    example: true,
    description: 'Statut actif de l’admin (par défaut: true)',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
