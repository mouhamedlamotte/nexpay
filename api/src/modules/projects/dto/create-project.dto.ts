import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { CallBacksDto } from 'src/modules/settings/callbacks/dto/callbacks.dto';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Project 1',
    required: true,
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Project 1 description',
    required: true,
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    type: CallBacksDto,
  })
  @ValidateNested()
  @Type(() => CallBacksDto)
  callbackUrls: CallBacksDto;

  @ApiPropertyOptional({
    example: {
      key1: 'value1',
      key2: 'value2',
    },
    required: false,
  })
  @IsOptional()
  metadata: Record<string, any>;
}
