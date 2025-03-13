import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT') || 3000;

  app.use(cookieParser());

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  await app.listen(port);
  console.log(`🚀 HTTP Server running on http://localhost:${port}`);
}

bootstrap();
