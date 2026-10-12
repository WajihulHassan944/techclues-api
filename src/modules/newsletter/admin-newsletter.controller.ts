import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NewsletterService } from './newsletter.service';
import {
  AddManySubscribersDto,
  AddSubscriberDto,
  DeleteByEmailDto,
  RemoveSubscribersDto,
  SetSubStatusDto,
} from './dto/admin-newsletter.dto';
import { SUB_SOURCES, SubStatus } from '../../database/schemas/subscriber.schema';

@UseGuards(JwtAuthGuard)
@Controller('admin/newsletter')
export class AdminNewsletterController {
  constructor(private readonly newsletter: NewsletterService) {}

  @Get()
  list(
    @Query('status') status?: SubStatus,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.newsletter.list({
      status,
      search,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get('stats')
  stats() {
    return this.newsletter.growthStats();
  }

  @Get('export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="subscribers.csv"')
  async export(
    @Query('status') status?: SubStatus,
    @Query('source') source?: (typeof SUB_SOURCES)[number],
    @Query('search') search?: string,
  ) {
    return this.newsletter.exportCsv({ status, source, search });
  }

  @Post()
  async add(@Body() dto: AddSubscriberDto) {
    const error = await this.newsletter.add(dto.email, dto.name, dto.source ?? 'manual');
    if (error) return { ok: false, error };
    return { ok: true };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async import(@UploadedFile() file: Express.Multer.File) {
    return this.newsletter.importCsv(file.buffer, 'import');
  }

  @Post('add-many')
  async addMany(@Body() dto: AddManySubscribersDto) {
    return this.newsletter.addMany(dto.emails, dto.source ?? 'import');
  }

  @Post('status')
  setStatus(@Body() dto: SetSubStatusDto) {
    return this.newsletter.setStatus(dto.ids, dto.status);
  }

  @Post('remove')
  remove(@Body() dto: RemoveSubscribersDto) {
    return this.newsletter.remove(dto.ids);
  }

  @Post('delete-by-email')
  deleteByEmail(@Body() dto: DeleteByEmailDto) {
    return this.newsletter.deleteByEmail(dto.email).then((count) => ({ count }));
  }
}
