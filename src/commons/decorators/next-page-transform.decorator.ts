import { BadRequestException } from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import { isNotEmpty } from 'class-validator';

export function NextPageTransform<T>(transformFn: (TValue: T) => any) {
  return Transform(({ value }: TransformFnParams) => {
    if (isNotEmpty(value)) {
      try {
        const decodedValue = decodeURIComponent(value);
        const base64 = decodedValue
          .replace(/-/g, '+') // '-' → '+'
          .replace(/_/g, '/'); // '_' → '/'

        const decoded = Buffer.from(base64, 'base64').toString('utf-8');
        return transformFn(JSON.parse(decoded));
      } catch (_) {
        throw new BadRequestException();
      }
    }

    return undefined;
  });
}
