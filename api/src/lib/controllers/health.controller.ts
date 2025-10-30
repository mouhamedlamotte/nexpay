import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

const reponse = {
  status: 'OK',
  message: 'Service is up and running',
  timestamp: '2025-10-30T17:43:18.925Z',
};

@Controller('health')
export class HealthController {
  @ApiOperation({ summary: 'Health Check Endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is up and running',
    example: reponse,
  })
  @Get()
  @HttpCode(200)
  getHealth() {
    return {
      status: 'OK',
      message: 'Service is up and running',
      timestamp: new Date().toISOString(),
    };
  }
}
