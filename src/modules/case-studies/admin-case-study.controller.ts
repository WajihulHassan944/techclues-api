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
import { CaseStudyService } from './case-study.service';
import { CreateCaseStudyDto, UpdateCaseStudyDto } from './dto/case-study.dto';
import { CaseStudyStatus } from '../../database/schemas/case-study.schema';

@UseGuards(JwtAuthGuard)
@Controller('admin/case-studies')
export class AdminCaseStudyController {
  constructor(private readonly caseStudies: CaseStudyService) {}

  @Get()
  list(
    @Query('status') status?: CaseStudyStatus,
    @Query('industry') industry?: string,
    @Query('service') service?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.caseStudies.list({
      status,
      industry,
      service,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.caseStudies.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCaseStudyDto) {
    return this.caseStudies.create(dto);
  }

  @Patch(':id')
  save(@Param('id') id: string, @Body() dto: UpdateCaseStudyDto) {
    return this.caseStudies.save(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.caseStudies.remove(id);
    return { ok: true };
  }

  @Get('meta/slug-available')
  async slugAvailable(@Query('slug') slug: string, @Query('excludeId') excludeId?: string) {
    return { available: !(await this.caseStudies.slugTaken(slug, excludeId)) };
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.caseStudies.uploadImage(file.buffer);
  }
}
