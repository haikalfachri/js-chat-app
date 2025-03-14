import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
    @ApiProperty({ example: 'senderId', description: 'The user ID of the sender' })
    @IsString()
    @IsNotEmpty()
    senderId: string;
    
    @ApiProperty({ example: 'receiverId', description: 'The user ID of the receiver of the message' })
    @IsString()
    @IsNotEmpty()
    receiverId: string;
    
    @ApiProperty({ example: 'Hello, how are you?', description: 'The content of the message (min 1 characters)' })
    @IsString()
    @IsNotEmpty()
    @Length(1, 1000)
    content: string;
}
