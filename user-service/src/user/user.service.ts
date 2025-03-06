import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KafkaService } from '../kafka/kafka.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kafkaService: KafkaService,
  ) { }

  async create(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
      },
      include: { profile: true },
    });

    await this.kafkaService.sendMessage('user.registered', {
      id: user.id,
      email: user.email,
      username: user.username,
    });

    return user;
  }

  async updateUserStatus(userId: string, isOnline: boolean) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isOnline },
    });

    await this.kafkaService.sendMessage('user.status.updated', {
      userId: user.id,
      isOnline: user.isOnline,
    });

    return user;
  }

  async getAllUsers() {
    return this.prisma.user.findMany();
  }

  async getById(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(userId: string, dto: UpdateUserDto) {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        username: dto.username,
        email: dto.email,
        phone: dto.phone,
        password: dto.password,
      },
      select: { id: true, email: true, username: true, phone: true },
    });

    return updatedUser;
  }

  async delete(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'User deleted successfully' };
  }
}
