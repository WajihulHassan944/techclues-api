import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchService } from './search.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get()
  get(@Query('q') q?: string) {
    return this.search.search(q ?? '');
  }
}
