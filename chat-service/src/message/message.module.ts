import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { KafkaModule } from '../kafka/kafka.module';
import { MessageGateway } from './message.gateway';

@Module({
  imports: [ PrismaModule, KafkaModule],
  controllers: [MessageController], // Registers the controller
  providers: [MessageService, MessageGateway], // Registers the service
  exports: [MessageService], // Allows other modules to use MessageService
})
export class MessageModule {}
