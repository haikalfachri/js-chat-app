import { Controller, Get} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  async getAllUsers() {
    const users = await this.userService.getAllUsers();
    
    if (!users.length) {
        return { message: 'No users found', data
        : [] };
      }
  
      return { message: 'Users fetched successfully', data: users };
  }
}