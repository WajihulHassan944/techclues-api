import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Feature } from '../auth/feature.decorator';
import { TestimonialService } from './testimonial.service';
import { CreateTestimonialDto, ReorderTestimonialsDto, UpdateTestimonialDto } from './dto/testimonial.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Feature('testimonials')
@Controller('admin/testimonials')
export class AdminTestimonialController {
  constructor(private readonly testimonials: TestimonialService) {}

  @Get()
  list() {
    return this.testimonials.listAll();
  }

  @Post()
  create(@Body() dto: CreateTestimonialDto) {
    return this.testimonials.create(dto);
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderTestimonialsDto) {
    return this.testimonials.reorder(dto.ids);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTestimonialDto) {
    return this.testimonials.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.testimonials.remove(id);
    return { ok: true };
  }
}
