import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';

export class CreateMessageDto {
    @ApiProperty({ example: 'senderId', description: 'The user ID of the sender' })
    @IsString()
    @IsNotEmpty()
    senderId: string;

    @ApiProperty({ example: 'receiverId', description: 'The user ID of the receiver' })
    @IsString()
    @IsNotEmpty()
    receiverId: string;

    @ApiProperty({ example: 'Hello, how are you?', description: 'The content of the message (required if fileUrl is not provided)' })
    @ValidateIf((o) => !o.fileUrl) // Validate if fileUrl is empty
    @IsString()
    @IsNotEmpty({ message: 'Content cannot be empty if no file is uploaded' })
    content?: string;

    @ApiProperty({ example: '/uploads/messages/sample.jpg', description: 'The file URL (required if content is not provided)' })
    @ValidateIf((o) => !o.content) // Validate if content is empty
    @IsString()
    @IsNotEmpty({ message: 'File URL cannot be empty if content is missing' })
    fileUrl?: string;
}