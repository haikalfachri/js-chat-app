import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { ApiTags, ApiResponse, ApiBody, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User registered successfully', schema: { example: { message: 'User registered successfully', data: { id: 1, email: 'user@example.com' } } } })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'User with this email already exists' })
  async register(@Body() registerDto: AuthDto) {
    try {
      const user = await this.authService.register(registerDto);
      return { message: 'User registered successfully', data: user };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      console.error(error);
      throw new BadRequestException('Registration failed');
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'User logged in successfully', schema: { example: { message: 'User logged in successfully', data: { accessToken: 'your-access-token' } } } })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid email or password' })
  async login(@Body() loginDto: AuthDto, @Res() res: Response) {
    try {
      const data = await this.authService.login(loginDto, res);
      return res.status(HttpStatus.OK).json({ message: 'User logged in successfully', data });
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  @Post('refresh')
  @ApiCookieAuth() 
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Access token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Req() req: Request, @Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      message: 'Access token refreshed successfully',
      data: await this.authService.refreshToken(req, res),
    });
  }

  @Post('logout')
  @ApiCookieAuth() 
  @ApiOperation({ summary: 'Logout user and clear refresh token' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  async logout(@Res() res: Response) {
    await this.authService.logout(res);
    return res.status(HttpStatus.OK).json({ message: 'User logged out successfully' });
  }
}
