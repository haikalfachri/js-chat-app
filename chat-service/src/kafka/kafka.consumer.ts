import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, EachMessagePayload, Consumer } from 'kafkajs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(KafkaConsumerService.name);
    private kafka: Kafka;
    private consumer: Consumer;
    private isKafkaConnected = false;

    constructor(private prisma: PrismaService) {
        const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];

        this.kafka = new Kafka({
            clientId: 'chat-service',
            brokers,
        });

        this.consumer = this.kafka.consumer({ groupId: 'chat-group' });
    }

    async onModuleInit() {
        await this.connectConsumer();
    }

    private async connectConsumer() {
        try {
            await this.consumer.connect();
            this.isKafkaConnected = true;
            this.logger.log('✅ Kafka Consumer connected successfully');

            await this.consumer.subscribe({ topic: 'user.registered', fromBeginning: false }); 
            this.logger.log('🎧 Listening to user.registered topic...');

            await this.consumer.run({
                eachMessage: async ({ message }: EachMessagePayload) => {
                    try {
                        if (!message.value) {
                            this.logger.error(`❌ Received empty message`);
                            return;
                        }

                        const userData = JSON.parse(message.value.toString());
                        this.logger.log(`📥 Received user data: ${JSON.stringify(userData)}`);

                        // ✅ Store user data in chat-service's database
                        await this.prisma.user.create({
                            data: {
                                id: userData.id,
                            },
                        });

                        this.logger.log(`✅ User stored successfully in chat-service DB`);
                    } catch (error) {
                        this.logger.error(`❌ Failed to process user registration: ${error.message}`);
                    }
                },
            });
        } catch (error) {
            this.isKafkaConnected = false;
            this.logger.warn('⚠️ Kafka is unavailable. Retrying connection...');
            setTimeout(() => this.connectConsumer(), 5000); // Retry after 5 seconds
        }
    }

    async onModuleDestroy() {
        if (this.consumer) {
            await this.consumer.disconnect();
        }
    }
}
