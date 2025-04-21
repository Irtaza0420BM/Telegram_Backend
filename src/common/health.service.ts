import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealthStatus() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'API is running correctly'
    };
  }

  processPostRequest(data: any) {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'POST request received successfully',
      receivedData: data,
      echo: data.message || 'No message provided'
    };
  }
}