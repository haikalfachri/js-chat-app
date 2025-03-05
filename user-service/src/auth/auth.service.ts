import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    private prisma = new PrismaClient();

    constructor(private readonly jwtService: JwtService) { }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new UnauthorizedException('Invalid email');

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new UnauthorizedException('Invalid password');

        return user;
    }

    async register(dto: RegisterDto) {
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
            },
        });

        return { message: 'User registered successfully', user: { id: user.id, email: user.email } };
    }


    async login(dto: LoginDto) {
        const user = await this.validateUser(dto.email, dto.password);
        const token = this.jwtService.sign({ userId: user.id });

        return { access_token: token };
    }
}
