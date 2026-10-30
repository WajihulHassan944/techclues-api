import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Feature } from '../auth/feature.decorator';
import { BlogService } from './blog.service';
import {
  CreateAuthorDto,
  CreateCategoryDto,
  CreatePostDto,
  UpdatePostDto,
} from './dto/blog-post.dto';
import { PostStatus } from '../../database/schemas/blog.schema';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Feature('blog')
@Controller('admin/blog')
export class AdminBlogController {
  constructor(private readonly blog: BlogService) {}

  @Get('posts')
  list(
    @Query('status') status?: PostStatus,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.blog.list({
      status,
      category,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get('posts/:id')
  get(@Param('id') id: string) {
    return this.blog.findOne(id);
  }

  @Post('posts')
  create(@Body() dto: CreatePostDto) {
    return this.blog.create({
      ...dto,
      scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
    });
  }

  @Patch('posts/:id')
  save(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.blog.save(id, {
      ...dto,
      scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
    });
  }

  @Post('posts/:id/duplicate')
  duplicate(@Param('id') id: string) {
    return this.blog.duplicate(id);
  }

  @Delete('posts/:id')
  async remove(@Param('id') id: string) {
    await this.blog.remove(id);
    return { ok: true };
  }

  @Get('slug-available')
  async slugAvailable(@Query('slug') slug: string, @Query('excludeId') excludeId?: string) {
    return { available: !(await this.blog.slugTaken(slug, excludeId)) };
  }

  @Get('categories')
  listCategories() {
    return this.blog.listCategories();
  }

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.blog.createCategory(dto.name);
  }

  @Patch('categories/:id')
  renameCategory(@Param('id') id: string, @Body() dto: CreateCategoryDto) {
    return this.blog.renameCategory(id, dto.name);
  }

  @Delete('categories/:id')
  async removeCategory(@Param('id') id: string) {
    await this.blog.removeCategory(id);
    return { ok: true };
  }

  @Get('authors')
  listAuthors() {
    return this.blog.listAuthors();
  }

  @Post('authors')
  createAuthor(@Body() dto: CreateAuthorDto) {
    return this.blog.createAuthor(dto.name, dto.role);
  }

  @Patch('authors/:id')
  updateAuthor(@Param('id') id: string, @Body() dto: CreateAuthorDto) {
    return this.blog.updateAuthor(id, dto.name, dto.role);
  }

  @Delete('authors/:id')
  async removeAuthor(@Param('id') id: string) {
    await this.blog.removeAuthor(id);
    return { ok: true };
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.blog.uploadImage(file.buffer, file.originalname);
  }
}
