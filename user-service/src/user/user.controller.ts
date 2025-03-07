import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EventPattern, Payload } from '@nestjs/microservices';
import * as fs from 'fs';
import * as path from 'path';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    return { message: 'User created successfully', data: user };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllUsers() {
    const users = await this.userService.getAllUsers();

    if (!users.length) {
      return { message: 'No users found', data
      : [] };
    }

    return { message: 'Users fetched successfully', data: users };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id') userId: string) {
    const user = await this.userService.getById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return { message: 'User fetched successfully', data: user };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateUser(@Param('id') userId: string, @Body() dto: UpdateUserDto) {
    const updatedUser = await this.userService.update(userId, dto);
    return { message: 'User updated successfully', data: updatedUser };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Explicit 204 No Content
  async deleteUser(@Param('id') userId: string) {
    await this.userService.delete(userId);
  }

  @EventPattern('user.status')
  async handleUserStatusUpdate(@Payload() data: { userId: string; isOnline: boolean }) {
    return this.userService.updateUserStatus(data.userId, data.isOnline);
  }
}
