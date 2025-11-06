import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { IsUrlOrEmpty } from 'src/lib/validators/IsUrlOrEmpty.validator';

export class CallBacksDto {
  @ApiPropertyOptional({
    example: 'https://example.com/success',
    required: false,
  })
  @IsOptional()
  @IsUrlOrEmpty()
  successUrl: string;

  @ApiPropertyOptional({
    example: 'https://example.com/failure',
    required: false,
  })
  @IsOptional()
  @IsUrlOrEmpty()
  failureUrl: string;
}
