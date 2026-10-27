import { Controller, Get } from '@nestjs/common';
import { TestimonialService } from './testimonial.service';

@Controller('public/testimonials')
export class PublicTestimonialController {
  constructor(private readonly testimonials: TestimonialService) {}

  @Get()
  list() {
    return this.testimonials.listPublic();
  }
}
