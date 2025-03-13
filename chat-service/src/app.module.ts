import { Module } from '@nestjs/common';
import { MessageModule } from './message/message.module';
import { KafkaModule } from './kafka/kafka.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), MessageModule, KafkaModule, PrismaModule, UserModule],
})

export class AppModule { }
