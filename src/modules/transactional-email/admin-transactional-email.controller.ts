import { Body, Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TransactionalEmailService } from './transactional-email.service';
import { UpdateTransactionalEmailDto } from './dto/transactional-email.dto';
import { TransactionalEmailKey } from '../../database/schemas/transactional-email.schema';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'admin')
@Controller('admin/transactional-emails')
export class AdminTransactionalEmailController {
  constructor(private readonly service: TransactionalEmailService) {}

  @Get()
  list() {
    return this.service.listAll();
  }

  @Put()
  update(@Body() dto: UpdateTransactionalEmailDto) {
    return this.service.update(dto);
  }

  @Delete(':key')
  reset(@Param('key') key: TransactionalEmailKey) {
    return this.service.resetToDefault(key);
  }
}
