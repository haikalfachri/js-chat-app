import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({ cors: true })
export class MessageGateway {
  constructor(private readonly messageService: MessageService) {}

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() dto: CreateMessageDto) {
    const message = await this.messageService.sendMessage(client.handshake.auth.userId, dto);
    client.broadcast.emit(`receiveMessage-${dto.receiverId}`, message);
    return message;
  }
}
