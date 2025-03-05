import { Module } from '@nestjs/common';
import { MessageModule } from './message/message.module';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [MessageModule, KafkaModule],
})

export class AppModule { }
