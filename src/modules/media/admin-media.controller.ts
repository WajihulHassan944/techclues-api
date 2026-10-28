import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { MediaService } from './media.service';
import { UpdateMediaAssetDto } from './dto/media.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/media')
export class AdminMediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  list(@Query('page') page?: string, @Query('pageSize') pageSize?: string, @Query('search') search?: string) {
    return this.media.list({ page: page ? Number(page) : undefined, pageSize: pageSize ? Number(pageSize) : undefined, search });
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: AuthUser) {
    return this.media.upload(file.buffer, file.originalname, user.email);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMediaAssetDto) {
    return this.media.updateAltText(id, dto.altText);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.media.remove(id);
  }
}
