import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { create } from 'node:domain';

@Controller('messages')
// @GuardedBy(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) { }

  @Post()
  async sendMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.createMessage(createMessageDto);
  }

  @Get(':user1Id/:user2Id')
  async getChatHistory(
    @Param('user1Id') user1Id: string,
    @Param('user2Id') user2Id: string
  ) {
    return this.messageService.getMessagesBetweenUsers(user1Id, user2Id);
  }
}
