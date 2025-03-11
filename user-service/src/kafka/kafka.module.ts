import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaModule {}
