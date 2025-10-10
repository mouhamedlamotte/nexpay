import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

@Controller('health')
export class HealthController {
  @ApiOperation({ summary: 'Health Check Endpoint' })
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
