import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { KafkaModule } from '../kafka/kafka.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [KafkaModule, PrismaModule],
  controllers: [UserController],
  providers: [UserService, JwtService],
})
export class UserModule {}
