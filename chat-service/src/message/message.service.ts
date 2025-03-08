import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) { }

  async sendMessage(senderId: string, dto: CreateMessageDto) {
    return this.prisma.message.create({
      data: {
        senderId,
        receiverId: dto.receiverId,
        content: dto.content,
      },
    });
  }

  async getMessages(userId: string, contactId: string) {
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
