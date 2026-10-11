import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CloudinaryService } from './cloudinary.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/uploads')
export class CloudinaryController {
  constructor(private readonly cloudinary: CloudinaryService) {}

  @Get('signature')
  signature(@Query('folder') folder?: string) {
    return this.cloudinary.createSignature(folder);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudinary.uploadBuffer(file.buffer);
    return result;
  }

  @Delete()
  @HttpCode(200)
  async remove(@Body('publicId') publicId: string) {
    await this.cloudinary.destroy(publicId);
    return { ok: true };
  }
}
