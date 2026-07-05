import { Controller, Post, UseInterceptors, UploadedFile, UploadedFiles, BadRequestException, Body } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('single')
  @ApiOperation({ summary: 'Upload single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          default: 'products',
          enum: ['products', 'categories', 'profiles', 'reviews'],
        },
        oldUrl: {
          type: 'string',
          description: 'Optional old file URL to delete on replace',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
    @Body('oldUrl') oldUrl?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const url = oldUrl
      ? await this.uploadService.replaceFile(file, folder || 'products', oldUrl)
      : await this.uploadService.uploadFile(file, folder || 'products');

    return { url };
  }

  @Post('multiple')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        folder: {
          type: 'string',
          default: 'products',
          enum: ['products', 'categories', 'profiles', 'reviews'],
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folder') folder?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const urls = await this.uploadService.uploadMultiple(files, folder || 'products');
    return { urls };
  }
}
