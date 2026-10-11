import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EnquiriesService } from './enquiries.service';
import {
  AddNoteDto,
  BlockEmailDto,
  BulkIdsDto,
  MoveFolderDto,
  SaveDraftDto,
  SendReplyDto,
  SetReadDto,
  SetStatusDto,
} from './dto/admin-inbox.dto';
import { Folder, StatusKey } from '../../database/schemas/enquiry.schema';

@UseGuards(JwtAuthGuard)
@Controller('admin/inbox')
export class AdminEnquiriesController {
  constructor(private readonly enquiries: EnquiriesService) {}

  @Get()
  list(
    @Query('folder') folder?: Folder,
    @Query('status') status?: StatusKey,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.enquiries.list({
      folder,
      status,
      search,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get('unread-count')
  unreadCount() {
    return this.enquiries.unreadCount().then((count) => ({ count }));
  }

  @Get('blocked')
  listBlocked() {
    return this.enquiries.listBlocked();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.enquiries.findOne(id);
  }

  @Patch('read')
  setRead(@Body() dto: SetReadDto) {
    return this.enquiries.setRead(dto.ids, dto.read);
  }

  @Patch(':id/star')
  toggleStar(@Param('id') id: string) {
    return this.enquiries.toggleStar(id);
  }

  @Patch('status')
  setStatus(@Body() dto: SetStatusDto) {
    return this.enquiries.setStatus(dto.ids, dto.status);
  }

  @Patch('move')
  moveTo(@Body() dto: MoveFolderDto) {
    return this.enquiries.moveTo(dto.ids, dto.folder);
  }

  @Post('delete-forever')
  deleteForever(@Body() dto: BulkIdsDto) {
    return this.enquiries.deleteForever(dto.ids);
  }

  @Post(':id/notes')
  addNote(@Param('id') id: string, @Body() dto: AddNoteDto) {
    return this.enquiries.addNote(id, dto.body);
  }

  @Patch(':id/draft')
  saveDraft(@Param('id') id: string, @Body() dto: SaveDraftDto) {
    return this.enquiries.saveDraft(id, dto.draft);
  }

  @Post(':id/reply')
  sendReply(@Param('id') id: string, @Body() dto: SendReplyDto) {
    return this.enquiries.sendReply(id, dto.body);
  }

  @Post('block')
  block(@Body() dto: BlockEmailDto) {
    return this.enquiries.block(dto.email);
  }

  @Post('unblock')
  unblock(@Body() dto: BlockEmailDto) {
    return this.enquiries.unblock(dto.email);
  }
}
