import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Messages') 
@ApiBearerAuth() 
@Controller('messages')
@UseGuards(JwtAuthGuard) 
export class MessageController {
  constructor(private readonly messageService: MessageService) { }

  @Post()
  @ApiOperation({ summary: 'Send a new message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully', schema: { example: { message: 'Message sent successfully', data: { id: '123', senderId: '1', receiverId: '2', message: 'Hello' } } } })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async createMessage(@Body() dto: CreateMessageDto) {
    const message = await this.messageService.createMessage(dto);
    return { message: 'Message sent successfully', data: message };
  }

  @Get(':user1Id/:user2Id')
  @ApiOperation({ summary: 'Get chat history between two users' })
  @ApiResponse({ status: 200, description: 'Chat history retrieved successfully' , schema: { example: { message: 'Chat history retrieved successfully', data: [] } } })
  @ApiResponse({ status: 404, description: 'No messages found' })
  async getChatHistory(
    @Param('user1Id') user1Id: string,
    @Param('user2Id') user2Id: string
  ) {
    const messages = await this.messageService.getMessagesBetweenUsers(user1Id, user2Id);

    if (!messages.length) {
      return { message: 'No messages found' };
    }

    return { message: 'Chat history retrieved successfully', data: messages };
  }
}
