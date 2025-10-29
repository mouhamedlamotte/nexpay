import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/lib';

const validShortBy = [
  'createdAt',
  'updatedAt',
  'firstName',
  'lastName',
  'email',
  'isActive',
];

export class GetUserDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: validShortBy,
    required: false,
  })
  @IsOptional()
  @IsEnum(validShortBy)
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Statut actif de l’admin (par défaut: true)',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;
}
