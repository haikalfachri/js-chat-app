import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { KafkaService } from '../kafka/kafka.service';
import { RegisterUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  private prisma = new PrismaClient()

  constructor(
    private readonly kafkaService: KafkaService,
  ) {}

  async register(dto: RegisterUserDto) {
    // Hash the password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create the user in the database
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword, // Store hashed password
      },
    });

    // Publish Kafka event after successful registration
    await this.kafkaService.sendMessage('user.registered', {
      id: user.id,
      email: user.email,
      username: user.username,
    });

    return { message: 'User registered successfully', user: { id: user.id, email: user.email, username: user.username } };
  }

  async updateUserStatus(userId: string, isOnline: boolean) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isOnline },
    });

    // 🔥 Send user status update event to Kafka
    await this.kafkaService.sendMessage('user.status.updated', {
      userId: user.id,
      isOnline: user.isOnline,
    });

    return user;
  }

  async getAllUsers() {
    return this.prisma.user.findMany();
  }

}
