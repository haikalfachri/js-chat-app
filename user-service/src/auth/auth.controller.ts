import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() registerDto: AuthDto) {
    const user = await this.authService.register(registerDto);
    return {
      message: 'User registered successfully',
      data: user,
    };
  }

  @Post('login')
  async login(@Body() loginDto: AuthDto) {
    const token = await this.authService.login(loginDto);
    return {
      message: 'User logged in successfully',
      data: token,
    };
  }
}
