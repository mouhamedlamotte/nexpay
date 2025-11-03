import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateWebhooksConfigDto {
  @ApiPropertyOptional({
    description: 'URL to notify on envent',
    example: 'https://example.com/success',
  })
  @IsString()
  @IsUrl()
  url: string;

  @ApiPropertyOptional({
    description: 'Description of webhook',
    example: 'Webhook to notify on envent',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Header to set secret',
    example: 'x-Webhook-Secret',
  })
  @IsOptional()
  @IsString()
  header?: string;

  @ApiPropertyOptional({
    description: 'Secret to set',
    example: '1f31dfd7-aec8-4adf-84ff-4a9c1981be2a',
  })
  @IsOptional()
  @IsString()
  secret?: string;
}
