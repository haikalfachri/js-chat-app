import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { KafkaModule } from '../kafka/kafka.module';
import { MessageGateway } from './message.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [ PrismaModule, KafkaModule],
  controllers: [MessageController], 
  providers: [MessageService, MessageGateway, JwtService], 
  exports: [MessageService], 
})
export class MessageModule {}
