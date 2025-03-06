import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) throw new UnauthorizedException('No token provided');

    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
    // const token = this.jwtService.sign({ userId: "4ab6513e-5dee-4fd7-85a9-6eae4b1c6fab" }, { secret: process.env.JWT_SECRET });
    console.log(`🪙 Token:  ${token}`);
    console.log(`🔍 Authorization Header: ${authHeader}`);
    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      request.user = decoded;
      return true;
    } catch (error) {
      console.error(`❌ JWT Verification Failed:`, error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
