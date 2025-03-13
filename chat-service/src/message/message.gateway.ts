import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private onlineUsers = new Map<string, string>(); // Maps userId -> socketId

  async handleConnection(socket: Socket) {
    console.log(`🚀 New connection attempt:`, socket.handshake);
    const userId = socket.handshake.query.userId as string;

    if (userId) {
      this.onlineUsers.set(userId, socket.id);
      console.log(`✅ User ${userId} connected with socket ID ${socket.id}`);
    } else {
      console.log("⚠️ Connection rejected: No userId provided");
      socket.disconnect(); // Optionally reject connection
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
