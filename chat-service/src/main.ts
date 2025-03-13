import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT') || 3000;

  app.enableCors({ origin: '*' });

  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(port);
  console.log(`🚀 HTTP Server running on http://localhost:${port}`);
}

bootstrap();
