import {
    Controller, Get, Patch, Param, Body, HttpCode, HttpStatus, UseGuards,
    UploadedFile, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as fs from 'fs';
import * as path from 'path';
import { extname } from 'path';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('profiles')
@ApiBearerAuth()
@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get(':userId')
    @ApiOperation({ summary: 'Get user profile' })
    @ApiResponse({ status: 200, description: 'Profile fetched successfully', schema: { example: { message: 'Profile fetched successfully', data: { name: 'John Doe', bio: 'Software Developer', image: 'profile.jpg' } } } })
    @ApiResponse({ status: 404, description: 'Profile not found' })
    @HttpCode(HttpStatus.OK)
    async get(@Param('userId') userId: string) {
        const profile = await this.profileService.get(userId);
        return { message: 'Profile fetched successfully', data: profile };
    }

    @Patch(':userId')
    @ApiOperation({ summary: 'Update user profile' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully', schema: { example: { message: 'Profile updated successfully', data: { name: 'John Doe', bio: 'Software Developer', image: 'profile.jpg' } } } })
    @ApiResponse({ status: 400, description: 'Invalid file format' })
    @ApiResponse({ status: 404, description: 'Profile not found' })
    @ApiConsumes('multipart/form-data') // Swagger now recognizes file uploads
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'John Doe' },
                bio: { type: 'string', example: 'Software Developer' },
                image: { type: 'string', format: 'binary' },
            },
        },
    })
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: path.join(__dirname, '..', '..', 'uploads', 'profile-pictures'),
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
            }
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                return cb(new Error('Only image files are allowed!'), false);
            }
            cb(null, true);
        }
    }))
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('userId') userId: string,
        @Body() dto: UpdateProfileDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        const userProfile = await this.profileService.get(userId);

        // Delete the previous image if exists
        if (userProfile.image) {
            const oldImagePath = path.join(__dirname, '..', '..', 'uploads', 'profile-pictures', userProfile.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Save new image path if file is uploaded
        const imagePath = file ? `/uploads/profile-pictures/${file.filename}` : undefined;
        const updatedProfile = await this.profileService.update(userId, dto, imagePath);

        return { message: 'Profile updated successfully', data: updatedProfile };
    }
}
