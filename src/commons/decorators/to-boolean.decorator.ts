import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

function valueToBoolean(value: unknown) {
  if (typeof value === 'string' && value === 'true') {
    return true;
  }
  if (typeof value === 'string' && value === 'false') {
    return false;
  }
  return value;
}

function OriginalToBoolean() {
  const toPlain = Transform(({ value }) => value, { toPlainOnly: true });

  function toClass(target: unknown, key: string) {
    return Transform(({ obj }) => valueToBoolean(obj[key]), { toClassOnly: true })(target, key);
  }

  return function decorate(target: unknown, key: string) {
    toPlain(target, key);
    toClass(target, key);
  };
}

export function ToBoolean() {
  return applyDecorators(OriginalToBoolean(), IsBoolean());
}
