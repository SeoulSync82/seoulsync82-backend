import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';

export function Cursor() {
  return Transform(({ value }) => {
    if (!value) return undefined;
    try {
      const b64 = value.replace(/-/g, '+').replace(/_/g, '/');
      const str = Buffer.from(b64, 'base64').toString('utf-8');
      return JSON.parse(str);
    } catch {
      throw new BadRequestException('Invalid cursor');
    }
  });
}
