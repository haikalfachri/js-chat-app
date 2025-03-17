import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageGateway } from './message.gateway';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messageGateway: MessageGateway,
  ) { }

  async createMessage(dto: CreateMessageDto, fileUrl?: string) {
    try {
      const message = await this.prisma.message.create({
        data: {
          senderId: dto.senderId,
          receiverId: dto.receiverId,
          content: dto.content,
          fileUrl: fileUrl,
        },
      });

      if (!message) {
        throw new NotFoundException('Message could not be created');
      }

      // Emit message to WebSocket clients
      this.messageGateway.handleMessage(dto.receiverId, {
        id: message.id,
        senderId: dto.senderId,
        receiverId: dto.receiverId,
        content: dto.content,
        fileUrl: fileUrl,
        createdAt: message.createdAt,
      });

      return message;
    } catch (error) {
      throw new Error('Error sending message: ' + error.message);
    }
  }

  async getMessagesBetweenUsers(user1Id: string, user2Id: string, page = 1, limit = 20) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: user1Id, receiverId: user2Id },
          { senderId: user2Id, receiverId: user1Id }
        ]
      },
      orderBy: { createdAt: 'asc' }, // Sort messages from oldest to newest
      take: 50 // You can increase or decrease this number as needed
    });

    if (!messages.length) {
      throw new NotFoundException('No chat history found between these users');
    }

    return messages;
  }
}
