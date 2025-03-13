import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { PrismaService } from '../prisma/prisma.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private onlineUsers = new Map<string, string>(); // Maps userId -> socketId

  constructor(private readonly prisma: PrismaService) {}

  async handleConnection(socket: Socket) {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
        this.onlineUsers.set(userId, socket.id);

        // Send undelivered messages
        const undeliveredMessages = await this.prisma.message.findMany({
            where: { receiverId: userId, isDelivered: false },
        });

        undeliveredMessages.forEach(async (message) => {
            this.server.to(socket.id).emit('newMessage', message);
            await this.prisma.message.update({
                where: { id: message.id },
                data: { isDelivered: true },
            });
        });

        console.log(`✅ User ${userId} connected, sent undelivered messages.`);
    }
}

  async handleDisconnect(socket: Socket) {
    const userId = [...this.onlineUsers.entries()].find(([_, id]) => id === socket.id)?.[0];
    if (userId) {
      this.onlineUsers.delete(userId);
      console.log(`❌ User ${userId} disconnected`);
    }
  }

  // 🔹 Send message to a specific user by receiverId
  sendMessageToUser(receiverId: string, message: any) {
    const receiverSocketId = this.onlineUsers.get(receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('newMessage', message);
      console.log(`📩 Sent message to user ${receiverId}:`, message);
    } else {
      console.log(`⚠️ User ${receiverId} is offline, message not sent via WebSocket`);
    }
  }
}
