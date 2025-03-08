import { Injectable, OnModuleInit, Logger, OnModuleDestroy } from '@nestjs/common';
import { Kafka, EachMessagePayload, Consumer } from 'kafkajs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(KafkaConsumerService.name);
    private kafka: Kafka;
    private consumer: Consumer | null = null;
    private kafkaEnabled = false; // Start with Kafka disabled
    private reconnectInterval = 5000; // 5 seconds

    constructor(private prisma: PrismaService) {
        const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
        this.kafka = new Kafka({
            clientId: 'chat-service',
            brokers,
        });
    }

    async onModuleInit() {
        this.connectToKafka();
    }

    private async connectToKafka() {
        if (this.consumer) return; // Prevent duplicate consumers

        this.consumer = this.kafka.consumer({ groupId: 'chat-group' });

        try {
            await this.consumer.connect();
            await this.consumer.subscribe({ topic: 'user.registered', fromBeginning: false });
            this.kafkaEnabled = true;
            this.logger.log('🎧 Successfully connected to Kafka and listening to user.registered topic.');

            await this.consumer.run({
                eachMessage: async ({ message }: EachMessagePayload) => {
                    try {
                        if (!message.value) {
                            this.logger.error(`❌ Received empty message`);
                            return;
                        }
                        const userData = JSON.parse(message.value.toString());
                        this.logger.log(`📥 Received user data: ${JSON.stringify(userData)}`);

                        await this.prisma.user.create({
                            data: { id: userData.id },
                        });

                        this.logger.log(`✅ User stored successfully in chat-service DB`);
                    } catch (error) {
                        this.logger.error(`❌ Failed to process user registration: ${error.message}`);
                    }
                },
            });

            this.consumer.on('consumer.disconnect', async () => {
                this.logger.warn('⚠️ Kafka consumer disconnected. Attempting to reconnect...');
                this.kafkaEnabled = false;
                this.consumer = null;
                this.scheduleReconnect();
            });
        } catch (error) {
            this.logger.warn('⚠️ Kafka connection failed. Retrying...');
            this.kafkaEnabled = false;
            this.consumer = null;
            this.scheduleReconnect();
        }
    }

    private scheduleReconnect() {
        setTimeout(() => {
            if (!this.kafkaEnabled) {
                this.logger.log('🔄 Attempting to reconnect to Kafka...');
                this.connectToKafka();
            }
        }, this.reconnectInterval);
    }

    async onModuleDestroy() {
        if (this.consumer) {
            await this.consumer.disconnect();
            this.logger.log('🔌 Kafka consumer disconnected.');
        }
    }
}
