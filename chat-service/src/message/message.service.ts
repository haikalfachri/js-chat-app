import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
// import { KafkaService } from '../kafka/kafka.service';
import { MessageGateway } from './message.gateway';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    // private readonly kafkaService: KafkaService,
    private readonly messageGateway: MessageGateway,
  ) { }

  async createMessage(dto: CreateMessageDto) {
    const message = await this.prisma.message.create({
      data: {
        senderId: dto.senderId,
        receiverId: dto.receiverId,
        content: dto.content,
      },
    });

    if (!message) {
      throw new BadRequestException('Failed to send message, sender or receiver not found');
    }

    // // ✅ Publish to Kafka (for distributed processing)
    // await this.kafkaService.sendMessage('chat.new-message', message);

    // ✅ Emit message to WebSocket clients in real-time
    this.messageGateway.handleMessage(dto.receiverId, message.content);

    return message;
  }


  async getMessagesBetweenUsers(userId: string, contactId: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: contactId },
          { senderId: contactId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
