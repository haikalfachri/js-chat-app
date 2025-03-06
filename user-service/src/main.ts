import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  // ✅ Start the HTTP API first
  const app = await NestFactory.create(AppModule);
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  await app.listen(process.env.APP_PORT || 3000);
  console.log(`🚀 HTTP Server running on http://localhost:${process.env.APP_PORT || 3000}`);
}

bootstrap();
