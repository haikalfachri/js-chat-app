import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateMessageDto {
    @IsString()
    @IsNotEmpty()
    senderId: string;
  
    @IsString()
    @IsNotEmpty()
    receiverId: string;
  
    @IsString()
    @IsNotEmpty()
    @Length(1, 1000)
    content: string;
}
