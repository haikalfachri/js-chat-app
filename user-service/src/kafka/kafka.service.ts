import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private producer: Producer | null = null;
  private kafka: Kafka;
  private isKafkaConnected = false;

  constructor(private readonly prisma: PrismaService) {
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
    await this.connectProducer();
    this.startRetryFailedMessages(); // Start background job to retry failed messages
  }

  private async connectProducer() {
    if (!this.producer) return;

    try {
      await this.producer.connect();
      this.isKafkaConnected = true;
      this.logger.log('✅ Kafka Producer connected successfully');
    } catch (error) {
      this.isKafkaConnected = false;
      this.logger.warn('⚠️ Kafka is not available. Retrying connection...');
      setTimeout(() => this.connectProducer(), 5000); // Retry connection after 5 seconds
    }
  }

  async sendMessage(topic: string, message: any) {
    if (!this.isKafkaConnected || !this.producer) {
      this.logger.warn(`⚠️ Kafka is down. Storing message in DB: ${topic}`);

      // Store the failed message in the database
      await this.prisma.failedMessage.create({
        data: {
          topic,
          message: JSON.stringify(message),
        },
      });

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

      // Store failed messages in the database
      await this.prisma.failedMessage.create({
        data: {
          topic,
          message: JSON.stringify(message),
        },
      });
    }
  }

  private async retryFailedMessagesFromDB() {
    if (!this.isKafkaConnected) return;

    const failedMessages = await this.prisma.failedMessage.findMany();

    if (failedMessages.length > 0) {
      this.logger.log(`🔄 Retrying ${failedMessages.length} failed Kafka messages...`);
    }

    for (const { id, topic, message } of failedMessages) {
      try {
        await this.sendMessage(topic, JSON.parse(message));
        await this.prisma.failedMessage.delete({ where: { id } }); // Delete from DB after successful send
      } catch (error) {
        this.logger.error(`❌ Failed to resend message to Kafka: ${error.message}`);
      }
    }
  }

  private startRetryFailedMessages() {
    setInterval(() => this.retryFailedMessagesFromDB(), 5000); // Retry every 5 seconds
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }
}
