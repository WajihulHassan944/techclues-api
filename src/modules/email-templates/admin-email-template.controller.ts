import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EmailTemplateService } from './email-template.service';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto } from './dto/email-template.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'admin', 'editor')
@Controller('admin/email-templates')
export class AdminEmailTemplateController {
  constructor(private readonly templates: EmailTemplateService) {}

  @Get()
  list() {
    return this.templates.list();
  }

  @Get('recipient-count')
  recipientCount() {
    return this.templates.previewRecipientCount();
  }

  @Post()
  create(@Body() dto: CreateEmailTemplateDto) {
    return this.templates.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmailTemplateDto) {
    return this.templates.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.templates.remove(id);
  }

  @Post(':id/send')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'admin')
  send(@Param('id') id: string) {
    return this.templates.sendCampaign(id);
  }
}
