import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { setupSwagger } from './swagger/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const appPort = configService.get<number>('APP_PORT') || 3000;
  const appUrl = configService.get<string>('APP_URL') || 'localhost';

  app.enableCors({ origin: '*' });

  app.useWebSocketAdapter(new IoAdapter(app));

  setupSwagger(app);

  await app.listen(appPort);
  console.log(`🚀 HTTP Server running on http://${appUrl}:${appPort}`);
  console.log(`📄 Swagger Docs available at: http://${appUrl}:${appPort}/api/docs`);
}

bootstrap();
