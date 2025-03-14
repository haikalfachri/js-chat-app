import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiProperty({ example: 'testuser', description: 'Username for the user' })
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'StrongPassword123', description: 'User password (min 6 characters)' })
    @MinLength(6)
    password: string;

    @ApiProperty({ example: '1234567890', description: 'User phone number (min 10 numbers, max 12 numbers)' })
    @MinLength(10)
    @MaxLength(12)
    phone: string;
}
