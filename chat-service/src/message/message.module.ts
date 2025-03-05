import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';

@Module({
  controllers: [MessageController], // Registers the controller
  providers: [MessageService], // Registers the service
  exports: [MessageService], // Allows other modules to use MessageService
})
export class MessageModule {}
