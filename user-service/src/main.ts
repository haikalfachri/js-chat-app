import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const appPort = configService.get<number>('APP_PORT') || 3001;
  const appUrl = configService.get<string>('APP_URL') || 'localhost';

  app.use(cookieParser());

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  const config = new DocumentBuilder()
    .setTitle('User Service API')
    .setDescription('API documentation for the user service (authentication & user management)')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(appPort);
  console.log(`🚀 HTTP Server running on http://${appUrl}:${appPort}`);
  console.log(`📄 Swagger Docs available at: http://${appUrl}:${appPort}/api/docs`);
}

bootstrap();
