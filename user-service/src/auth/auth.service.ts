import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly kafkaService: KafkaService,
    ) { }

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

        return user
    }


    async login(dto: AuthDto) {
        const user = await this.validateUser(dto.email, dto.password);
        const token = this.jwtService.sign({ userId: user.id });

        return { token: token };
    }
}
