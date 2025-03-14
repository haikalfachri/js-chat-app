import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
    @ApiProperty({ example: 'John Doe', description: 'Name of the user' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ example: 'Software Developer', description: 'User bio' })
    @IsOptional()
    @IsString()
    bio?: string;
}