import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('messages')
// @UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async sendMessage(@Req() req, @Body() dto: CreateMessageDto) {
    return this.messageService.sendMessage(req.user.id, dto);
  }

  @Get(':contactId')
  async getMessages(@Req() req, @Param('contactId') contactId: string) {
    return this.messageService.getMessages(req.user.id, contactId);
  }
}
