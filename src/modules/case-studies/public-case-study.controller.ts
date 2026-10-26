import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { CaseStudyService } from './case-study.service';

@Controller('public/case-studies')
export class PublicCaseStudyController {
  constructor(private readonly caseStudies: CaseStudyService) {}

  @Get()
  list(
    @Query('industry') industry?: string,
    @Query('service') service?: string,
    @Query('featured') featured?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.caseStudies.listPublic({
      industry,
      service,
      featured: featured === 'true',
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get(':slug')
  async get(@Param('slug') slug: string) {
    const doc = await this.caseStudies.findBySlug(slug);
    if (doc.status !== 'published') throw new NotFoundException('Case study not found');
    return doc;
  }
}
