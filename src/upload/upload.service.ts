import { Injectable, BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class UploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads');
  private readonly allowedFolders = new Set(['products', 'categories', 'profiles', 'reviews']);
  private readonly allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
  ]);
  private readonly maxFileSize = Number(process.env.MAX_FILE_SIZE || 5 * 1024 * 1024);

  constructor() {
    // Ensure upload directories exist
    this.ensureDirectoryExists(this.uploadDir);
    this.ensureDirectoryExists(join(this.uploadDir, 'products'));
    this.ensureDirectoryExists(join(this.uploadDir, 'categories'));
    this.ensureDirectoryExists(join(this.uploadDir, 'profiles'));
    this.ensureDirectoryExists(join(this.uploadDir, 'reviews'));
  }

  private ensureDirectoryExists(directory: string) {
    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
    }
  }

  private validateFolder(folder: string) {
    if (!this.allowedFolders.has(folder)) {
      throw new BadRequestException(`Invalid folder. Allowed folders: ${Array.from(this.allowedFolders).join(', ')}`);
    }
  }

  private validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!this.allowedMimeTypes.has(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File too large. Maximum size is ${Math.floor(this.maxFileSize / (1024 * 1024))}MB`);
    }
  }

  async deleteFileByUrl(fileUrl?: string): Promise<void> {
    if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
      return;
    }

    const normalized = fileUrl.replace('\\', '/');
    const pathWithoutPrefix = normalized.replace(/^\/uploads\//, '');
    const absolutePath = join(this.uploadDir, pathWithoutPrefix);

    if (!absolutePath.startsWith(this.uploadDir)) {
      return;
    }

    const { unlink } = await import('fs/promises');
    try {
      await unlink(absolutePath);
    } catch {
      return;
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'products'): Promise<string> {
    this.validateFolder(folder);
    this.validateFile(file);

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const ext = extname(file.originalname);
    const filename = `${timestamp}-${randomString}${ext}`;
    
    const folderPath = join(this.uploadDir, folder);
    this.ensureDirectoryExists(folderPath);
    
    const filepath = join(folderPath, filename);
    await writeFile(filepath, file.buffer);
    
    // Return relative URL path
    return `/uploads/${folder}/${filename}`;
  }

  async replaceFile(file: Express.Multer.File, folder: string, oldUrl?: string): Promise<string> {
    const newUrl = await this.uploadFile(file, folder);
    if (oldUrl) {
      await this.deleteFileByUrl(oldUrl);
    }
    return newUrl;
  }

  async uploadMultiple(files: Express.Multer.File[], folder: string = 'products'): Promise<string[]> {
    this.validateFolder(folder);
    files.forEach((file) => this.validateFile(file));

    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }
}
