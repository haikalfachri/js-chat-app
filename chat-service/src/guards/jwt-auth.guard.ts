import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService, 
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) throw new UnauthorizedException('No token provided');

    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
    // const token = this.jwtService.sign({ userId: "4ab6513e-5dee-4fd7-85a9-6eae4b1c6fab" }, { secret: process.env.JWT_SECRET });
    console.log(`🪙 Token:  ${token}`);
    console.log(`🔍 Authorization Header: ${authHeader}`);
    try {
      const secret = this.configService.get<string>('JWT_SECRET'); // Fetch secret dynamically
      const decoded = this.jwtService.verify(token, { secret });
      request.user = decoded;
      return true;
    } catch (error) {
      console.error(`❌ JWT Verification Failed:`, error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  canActivateWs(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient(); // Extract WebSocket client
    const token = client.handshake?.headers?.authorization?.split(' ')[1];

    if (!token) throw new UnauthorizedException('No token provided');

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const decoded = this.jwtService.verify(token, { secret });
      (client as any).user = decoded; // Attach decoded user to socket
      return true;
    } catch (error) {
      console.error(`❌ WebSocket JWT Verification Failed:`, error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
