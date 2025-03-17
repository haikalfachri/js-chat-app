import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private onlineUsers = new Map<string, string>(); // Maps userId -> socketId

  constructor(private readonly prisma: PrismaService) { }

  async handleConnection(socket: Socket) {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      this.onlineUsers.set(userId, socket.id);

      // Fetch undelivered messages
      const undeliveredMessages = await this.prisma.message.findMany({
        where: { receiverId: userId, isDelivered: false },
      });

      undeliveredMessages.forEach(async (message) => {
        console.log(`📩 Sending undelivered message to user ${userId}:`,
          {
            content: message.content,
            fileUrl: message.fileUrl
          });
          
        this.server.to(socket.id).emit('newMessage', {
          content: message.content,
          fileUrl: message.fileUrl,
        });

        // Mark as delivered
        await this.prisma.message.update({
          where: { id: message.id },
          data: { isDelivered: true },
        });
      });

      console.log(`✅ User ${userId} connected, sent ${undeliveredMessages.length} undelivered messages.`);
    }
  }


  async handleDisconnect(socket: Socket) {
    const userId = [...this.onlineUsers.entries()].find(([_, id]) => id === socket.id)?.[0];
    if (userId) {
      this.onlineUsers.delete(userId);
      console.log(`❌ User ${userId} disconnected`);
    }
  }

  @UseGuards(JwtAuthGuard)
  async handleMessage(receiverId: string, message: any) {
    const receiverSocketId = this.onlineUsers.get(receiverId);

    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('newMessage', {
        content: message.content,
        fileUrl: message.fileUrl
      });
      console.log(`📩 Sent message to user ${receiverId}:`, message.content, message.fileUrl);

      // Update the message to delivered
      await this.prisma.message.update({
        where: { id: message.id },
        data: { isDelivered: true },
      });
    } else {
      console.log(`⚠️ User ${receiverId} is offline, message stored for later delivery`);
    }
  }
}
