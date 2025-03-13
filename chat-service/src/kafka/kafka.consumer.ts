import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, EachMessagePayload, Consumer } from 'kafkajs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(KafkaConsumerService.name);
    private kafka: Kafka;
    private consumer: Consumer;
    private isKafkaConnected = false;

    private readonly topics = ['user.registered', 'chat.new-message', 'user.updated', 'user.deleted']; // ✅ Add multiple topics here

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

            // ✅ Subscribe to multiple topics
            for (const topic of this.topics) {
                await this.consumer.subscribe({ topic, fromBeginning: false });
                this.logger.log(`🎧 Listening to topic: ${topic}`);
            }

            await this.consumer.run({
                eachMessage: async ({ topic, message }: EachMessagePayload) => {
                    try {
                        if (!message.value) {
                            this.logger.error(`❌ Received empty message from ${topic}`);
                            return;
                        }

                        const parsedData = JSON.parse(message.value.toString());
                        this.logger.log(`📥 Received message from ${topic}: ${JSON.stringify(parsedData)}`);

                        // ✅ Handle different topics
                        switch (topic) {
                            case 'user.registered':
                                await this.handleUserRegistered(parsedData);
                                break;
                            case 'user.updated':
                                await this.handleUserUpdated(parsedData);
                                break;
                            case 'chat.new-message':
                                await this.handleChatMessage(parsedData);
                                break;
                            case 'user.deleted':
                                await this.handleUserDeleted(parsedData);
                                break;
                            default:
                                this.logger.warn(`⚠️ No handler for topic: ${topic}`);
                        }
                    } catch (error) {
                        this.logger.error(`❌ Failed to process message from ${topic}: ${error.message}`);
                    }
                },
            });
        } catch (error) {
            this.isKafkaConnected = false;
            this.logger.warn('⚠️ Kafka is unavailable. Retrying connection...');
            setTimeout(() => this.connectConsumer(), 5000); // Retry after 5 seconds
        }
    }

    private async handleUserRegistered(userData: any) {
        await this.prisma.user.create({
            data: {
                id: userData.id,
                username: userData.username,
            },
        });
        this.logger.log(`✅ User stored successfully in message-service DB`);
    }

    private async handleUserUpdated(userData: any) {
        await this.prisma.user.update({
            where: { id: userData.id },
            data: {
               username: userData.username,
            },
        },);

        this.logger.log(`✅ User stored successfully in message-service DB`);
    }

    private async handleUserDeleted(userData: any) {
        await this.prisma.user.delete({
            where: { id: userData.id },
        },);

        this.logger.log(`✅ User stored successfully in message-service DB`);
    }

    private async handleChatMessage(messageData: any) {
        await this.prisma.message.create({
            data: {
                senderId: messageData.senderId,
                receiverId: messageData.receiverId,
                content: messageData.content,
            },
        });
        this.logger.log(`✅ Chat message stored successfully`);
    }

    async onModuleDestroy() {
        if (this.consumer) {
            await this.consumer.disconnect();
        }
    }
}
