import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { KafkaConsumerService } from './kafka.consumer';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [KafkaService, KafkaConsumerService],
  exports: [KafkaService, KafkaConsumerService],
})
export class KafkaModule {}