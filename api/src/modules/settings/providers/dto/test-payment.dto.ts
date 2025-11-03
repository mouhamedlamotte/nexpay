import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class TestPaymentDto {
  @ApiProperty({
    example: 5000,
    required: true,
    description: 'Amount to be paid',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: '+22177123456',
    description: 'Phone number of the entity making the payment',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: '1f31dfd7-aec8-4adf-84ff-4a9c1981be2a',
    description: 'ID of the project making the payment',
  })
  @IsString()
  projectId: string;
}
