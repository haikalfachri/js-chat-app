import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  Res,
  HttpCode,
  NotFoundException,
  ConflictException,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created successfully', schema: { example: { message: 'User created successfully', data: { id: '123', email: 'user@example.com', username: 'testuser' } } } })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'User with this email already exists' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.create(createUserDto);
      return { message: 'User created successfully', data: user };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      console.error(error);
      throw new NotFoundException('Error creating user');
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List all users', schema: { example: { message: 'Users fetched successfully', data: [] } } })
  async getAllUsers() {
    const users = await this.userService.getAllUsers();
    return { message: users.length ? 'Users fetched successfully' : 'No users found', data: users };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User details', schema: { example: { message: 'User fetched successfully', data: { id: '123', username: 'testuser', email: 'test@example.com', profile: { image: 'profile.jpg' } } } } })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async getUser(@Param('id') userId: string) {
    const user = await this.userService.getById(userId);
    if (!user) throw new NotFoundException('User not found');
    return { message: 'User fetched successfully', data: user };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user details' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User updated successfully', schema: { example: { message: 'User updated successfully', data: { id: '123', username: 'updatedUser', email: 'updated@example.com' } } } })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async updateUser(@Param('id') userId: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.userService.update(userId, updateUserDto);
      return { message: 'User updated successfully', data: updatedUser };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ConflictException) throw error;
      throw new NotFoundException('User not found');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'User deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async deleteUser(@Param('id') userId: string, @Res() res: Response) {
    try {
      await this.userService.delete(userId);
      return res.status(HttpStatus.OK).json({ message: 'User deleted successfully' });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(error);
      throw new Error('Could not delete user');
    }
  }
}
