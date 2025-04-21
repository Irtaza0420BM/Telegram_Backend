import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

class HealthCheckDto {
  message?: string;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}
  
  @Get()
  @ApiOperation({ summary: 'Check if the API is running' })
  @ApiResponse({ status: 200, description: 'API is running correctly' })
  healthCheck() {
    return this.healthService.getHealthStatus();
  }

  @Post()
  @ApiOperation({ summary: 'Test POST endpoint functionality' })
  @ApiResponse({ status: 200, description: 'POST request processed successfully' })
  testPost(@Body() healthCheckDto: HealthCheckDto) {
    return this.healthService.processPostRequest(healthCheckDto);
  }
}