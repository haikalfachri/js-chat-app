import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) throw new UnauthorizedException('No token provided');

    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
    try {
      const decoded = this.jwtService.verify(token);
      request.user = decoded; // Attach user data to the request
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
