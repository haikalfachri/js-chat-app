import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.APP_PORT || 3000);
  console.log('HTTP Server running on http://localhost:3000');

  // ✅ Create Kafka Microservice
  const kafkaApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'user-service-consumer',
      },
    },
  });

  kafkaApp.listen();
  console.log('Kafka Microservice connected...');
}

bootstrap();