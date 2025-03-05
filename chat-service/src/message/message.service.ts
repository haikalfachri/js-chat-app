import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';

@Injectable()
export class MessageService implements OnModuleInit {
  private kafka = new Kafka({
    clientId: 'message-service',
    brokers: ['localhost:9092'],
  });

  private consumer: Consumer = this.kafka.consumer({ groupId: 'message-group' });

  async onModuleInit() {
    await this.consumer.connect();
    console.log('🔥 Kafka Consumer Connected');

    await this.consumer.subscribe({ topic: 'user.registered', fromBeginning: true });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (message.value !== null) {
          console.log(`📥 Received message on topic "${topic}":`, message.value.toString());
        }
      },
    });
  }
}
