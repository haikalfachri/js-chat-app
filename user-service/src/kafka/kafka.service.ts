import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private producer: Producer | null = null;
  private kafka: Kafka;
  private isKafkaConnected = false;
  private reconnectInterval = 5000; // 5 seconds

  constructor() {
    const brokers = process.env.KAFKA_BROKERS
      ? process.env.KAFKA_BROKERS.split(',')
      : ['localhost:9092'];

    this.kafka = new Kafka({
      clientId: 'user-service',
      brokers,
    });

    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    this.connectToKafka(); // ✅ Start Kafka in the background, but don't block service startup
  }

  private async connectToKafka() {
    try {
      if (!this.producer) return; 
      await this.producer.connect();
      this.isKafkaConnected = true;
      this.logger.log('✅ Kafka Producer connected successfully');
    } catch (error) {
      this.logger.warn('⚠️ Kafka is not available. Running without Kafka...');
      this.isKafkaConnected = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    setTimeout(async () => {
      if (!this.isKafkaConnected) {
        this.logger.log('🔄 Attempting to reconnect Kafka Producer...');
        await this.connectToKafka();
      }
    }, this.reconnectInterval);
  }

  async sendMessage(topic: string, message: any) {
    if (!this.producer || !this.isKafkaConnected) {
      this.logger.warn(`⚠️ Kafka is unavailable. Skipping message to topic: ${topic}`);
      return;
    }

    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
      this.logger.log(`📩 Message sent to topic: ${topic}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send Kafka message: ${error.message}`);
      this.isKafkaConnected = false;
      this.scheduleReconnect();
    }
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
      this.logger.log('🔌 Kafka Producer disconnected.');
    }
  }
}
