import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [ UserModule, KafkaModule ],
})
export class AppModule {}
