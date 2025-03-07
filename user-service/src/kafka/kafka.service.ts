import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private producer: Producer | null = null;
  private kafka: Kafka;

  constructor() {
    const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];

    this.kafka = new Kafka({
      clientId: 'user-service',
      brokers,
    });

    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    if (!this.producer) return; // ✅ Avoid connecting if Kafka is already disabled
    try {
      await this.producer.connect();
      this.logger.log('✅ Kafka Producer connected successfully');
    } catch (error) {
      this.logger.warn('⚠️ Kafka is not available. Running without Kafka...');
      this.producer = null; // ✅ Disable Kafka functionality but keep service running
    }
  }

  async sendMessage(topic: string, message: any) {
    if (!this.producer) {
      this.logger.warn(`⚠️ Kafka is unavailable. Skipping message to topic: ${topic}`);
      return; // Skip message sending when Kafka is down
    }

    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
      this.logger.log(`📩 Message sent to topic: ${topic}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send Kafka message: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }
}
