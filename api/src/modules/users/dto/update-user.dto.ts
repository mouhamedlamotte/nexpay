import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    example: false,
    description: 'Statut de l’utilisateur',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
