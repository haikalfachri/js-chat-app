import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class StorageService {
    private storageProvider: 'local' | 's3' | 'gcp' = 'local'; // Change to desired storage provider

    constructor() {
        if (process.env.STORAGE_PROVIDER) {
            this.storageProvider = process.env.STORAGE_PROVIDER as 'local' | 's3' | 'gcp';
        }
    }

    async uploadFile(filename: string, buffer: Buffer): Promise<string> {
        switch (this.storageProvider) {
            case 'local':
                this.uploadToLocal(filename, buffer);
            default:
                throw new Error('Invalid storage provider');
        }
    }

    private async uploadToLocal(filename: string, buffer: Buffer): Promise<string> {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        const filePath = path.join(uploadDir, filename);
        await fs.promises.writeFile(filePath, buffer);

        return `/uploads/${filename}`;
    }
}

