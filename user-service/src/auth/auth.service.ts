import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { KafkaService } from 'src/kafka/kafka.service';
import { AuthDto } from './dto/auth.dto';
import { Response, Request } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly kafkaService: KafkaService
    ) {}

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new UnauthorizedException('Invalid email');

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new UnauthorizedException('Invalid password');

        return user;
    }

    async register(dto: AuthDto) {
        const userExists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (userExists) throw new ConflictException('User with this email already exists');

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                profile: {
                    create: {},
                },
            },
            include: { profile: true },
        });

        await this.kafkaService.sendMessage('user.registered', {
            id: user.id,
        });

        return user;
    }

    async login(dto: AuthDto, res: Response) {
        const user = await this.validateUser(dto.email, dto.password);
    
        const accessToken = this.jwtService.sign(
            { userId: user.id },
            { secret: process.env.JWT_SECRET, expiresIn: '1h' }
        );
    
        const refreshToken = this.jwtService.sign(
            { userId: user.id },
            { secret: process.env.REFRESH_SECRET, expiresIn: '30d' }
        );
    
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
    
        return { accessToken };
    }
    
    async refreshToken(req: Request, res: Response) {
        const refreshToken = req.cookies['refresh_token'];
        if (!refreshToken) throw new UnauthorizedException('No refresh token provided');
    
        try {
            const decoded = this.jwtService.verify(refreshToken, { secret: process.env.REFRESH_SECRET });
    
            const newAccessToken = this.jwtService.sign(
                { userId: decoded.userId },
                { secret: process.env.JWT_SECRET, expiresIn: '1h' }
            );
    
            return { accessToken: newAccessToken };
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }    

    async logout(res: Response) {
        res.clearCookie('refresh_token');
        return 
    }
}
