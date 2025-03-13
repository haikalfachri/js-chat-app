import { Controller, Post, Body, Res, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: AuthDto) {
    const user = await this.authService.register(registerDto);
    return { message: 'User registered successfully', data: user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: AuthDto, @Res() res: Response) {
    const data = await this.authService.login(loginDto, res);
    return res.status(HttpStatus.OK).json({ message: 'User logged in successfully', data });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res() res: Response) {
    const data = await this.authService.refreshToken(req, res);
    return res.status(HttpStatus.OK).json({ message: 'Access token refreshed successfully', data });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res() res: Response) {
    await this.authService.logout(res);
    return res.status(HttpStatus.OK).json({ message: 'User logged out successfully' });
  }
}
