import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody , ApiProperty} from '@nestjs/swagger';
import { HealthService } from './health.service';

class HealthCheckDto {
  @ApiProperty({
    description: 'Optional message to include with the health check',
    required: false,
    example: 'Testing health endpoint'
  })
  message?: string;
}

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}
  
  @ApiOperation({ 
    summary: 'Check API health status',
    description: 'Verifies if the API is running correctly and returns health information'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API is running correctly',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number' },
        version: { type: 'string' }
      }
    }
  })
  @Get()
  healthCheck() {
    return this.healthService.getHealthStatus();
  }

  @ApiOperation({ 
    summary: 'Test POST functionality',
    description: 'Tests if POST requests are processed correctly'
  })
  @ApiBody({
    type: HealthCheckDto,
    description: 'Optional message to process'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'POST request processed successfully',
    schema: {
      type: 'object',
      properties: {
        received: { type: 'boolean', example: true },
        message: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })
  @Post()
  testPost(@Body() healthCheckDto: HealthCheckDto) {
    return this.healthService.processPostRequest(healthCheckDto);
  }
}
