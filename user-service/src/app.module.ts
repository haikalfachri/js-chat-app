import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { KafkaModule } from './kafka/kafka.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UserModule, KafkaModule, PrismaModule, ProfileModule, AuthModule],
})
export class AppModule { }
