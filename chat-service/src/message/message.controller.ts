import { Controller, Get, Post, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { UploadedFile, UseInterceptors } from '@nestjs/common';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) { }

  @Post()
  @ApiOperation({ summary: 'Send a new message with optional file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        senderId: { type: 'string', example: 'user123' },
        receiverId: { type: 'string', example: 'user456' },
        content: { type: 'string', example: 'Hello!' },
        file: { type: 'string', format: 'binary' }
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: path.join(__dirname, '..', '..', 'uploads', 'messages'),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file) {
        return cb(null, true); // Allow empty file
      }
      if (!file.mimetype.match(/\/(jpg|jpeg|png|mp4|pdf|docx)$/)) {
        return cb(new Error('Invalid file type!'), false);
      }
      cb(null, true);
    }
  }))
  async createMessage(
    @Body() dto: CreateMessageDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const fileUrl = file ? `/uploads/messages/${file.filename}` : undefined;

    if (!dto.content && !fileUrl) {
      throw new BadRequestException('Content or file is required');
    }

    const message = await this.messageService.createMessage(dto, fileUrl);
    return { message: 'Message sent successfully', data: message };
  }

  @Get(':user1Id/:user2Id')
  @ApiOperation({ summary: 'Get chat history between two users' })
  @ApiResponse({ status: 200, description: 'Chat history retrieved successfully', schema: { example: { message: 'Chat history retrieved successfully', data: [] } } })
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
