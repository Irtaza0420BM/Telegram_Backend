import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  // Create app with logger configuration
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buffers logs until logger is ready
  });

  // Configure logger BEFORE any other operations
  app.useLogger(app.get(Logger)); // Now properly configured
  
  // Rest of your configuration
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger configuration
  const configService = app.get(ConfigService);
  const isSwaggerEnabled = configService.get('NODE_ENV') !== 'production' || 
                          configService.get('ENABLE_SWAGGER') === 'true';

  if (isSwaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Auth API')
      .setDescription('Authentication API with email OTP and Telegram ID mapping')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      customSiteTitle: 'Auth API Docs',
      customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
      ],
    });

    // Serve static assets from CDN instead of node_modules
    app.use('/swagger-ui', express.static(join(__dirname, '..', 'public/swagger')));
  }

  // Get port from config
  const port = configService.get<number>('PORT') || 3000;

  // Start application
  await app.listen(port);
  
  // Use logger instead of console.log
  const logger = app.get(Logger);
  logger.log(`Application is running on: http://localhost:${port}`);
  if (isSwaggerEnabled) {
    logger.log(`Swagger documentation: http://localhost:${port}/api`);
  }
}

bootstrap();