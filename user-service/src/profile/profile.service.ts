import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
    constructor(private readonly prisma: PrismaService) { }

    async get(userId: string) {
        const profile = await this.prisma.profile.findUnique({ where: { userId } });

        if (!profile) {
            throw new NotFoundException(`Profile for user ID ${userId} not found`);
        }

        return profile;
    }

    async update(userId: string, dto: UpdateProfileDto, imagePath?: string) {
        try {
            const updatedProfile = await this.prisma.profile.update({
                where: { userId },
                data: {
                    name: dto.name,
                    bio: dto.bio,
                    ...(imagePath && { image: imagePath })
                },
            });

            return updatedProfile;
        } catch (error) {
            throw new NotFoundException(`Profile for user ID ${userId} not found`);
        }
    }
}
