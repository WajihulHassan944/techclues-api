import { BadRequestException } from '@nestjs/common';

/** Silently-named field ("website" or similar) that real users never fill in. */
export function checkHoneypot(value: unknown) {
  if (typeof value === 'string' && value.trim().length > 0) {
    // Don't reveal that this was a bot trap — just reject like any other bad request.
    throw new BadRequestException('Unable to process submission');
  }
}
