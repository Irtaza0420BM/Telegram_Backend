import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

class HealthCheckDto {
  message?: string;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  
  @Get()
  @ApiOperation({ summary: 'Check if the API is running' })
  @ApiResponse({ status: 200, description: 'API is running correctly' })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'API is running correctly'
    };
  }

  @Post()
  @ApiOperation({ summary: 'Test POST endpoint functionality' })
  @ApiResponse({ status: 200, description: 'POST request processed successfully' })
  testPost(@Body() healthCheckDto: HealthCheckDto) {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'POST request received successfully',
      receivedData: healthCheckDto,
      echo: healthCheckDto.message || 'No message provided'
    };
  }
}