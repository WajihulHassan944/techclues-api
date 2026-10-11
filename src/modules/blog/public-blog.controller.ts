import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('public/blog')
export class PublicBlogController {
  constructor(private readonly blog: BlogService) {}

  @Get()
  list(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.blog.listPublic({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get(':slug')
  async get(@Param('slug') slug: string) {
    const post = await this.blog.findBySlug(slug);
    if (post.status !== 'published') throw new NotFoundException('Post not found');
    return post;
  }
}
