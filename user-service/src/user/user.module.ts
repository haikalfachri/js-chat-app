import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { KafkaModule } from '../kafka/kafka.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [KafkaModule, PrismaModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
