import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    UploadedFile,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { extname } from 'path';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get(':userId')
    @HttpCode(HttpStatus.OK)
    async get(@Param('userId') userId: string) {
        const profile = await this.profileService.get(userId);
        return { message: 'Profile fetched successfully', data: profile };
    }

    @Patch(':userId')
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: '../../uploads/profile-pictures', // Directory to save images
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
        @UploadedFile() file: Express.Multer.File
    ) {
        const imagePath = file ? `/uploads/profile-pictures/${file.filename}` : undefined;
        const updatedProfile = await this.profileService.update(userId, dto, imagePath);

        return { message: 'Profile updated successfully', data: updatedProfile };
    }
}
