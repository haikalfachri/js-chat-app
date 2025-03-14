import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: { example: { message: "Users fetched successfully", data: [] } }
  })
  @ApiResponse({ status: 404, description: 'No users found' })
  async getAllUsers() {
    const users = await this.userService.getAllUsers();

    if (!users.length) {
      return { message: 'No users found', data: [] };
    }

    return { message: 'Users fetched successfully', data: users };
  }
}
