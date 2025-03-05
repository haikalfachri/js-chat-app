import { Controller, Post, Body, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/create-user.dto';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    console.log(Body);
    return this.userService.register(registerUserDto);
  }

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers
  }

  @EventPattern('user.status')
  async handleUserStatusUpdate(@Payload() data: { userId: string; isOnline: boolean }) {
    return this.userService.updateUserStatus(data.userId, data.isOnline);
  }
}
