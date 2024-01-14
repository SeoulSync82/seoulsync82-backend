import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export function ToBoolean() {
  return applyDecorators(OriginalToBoolean(), IsBoolean());
}

function OriginalToBoolean() {
  const toPlain = Transform(
    ({ value }) => {
      return value;
    },
    {
      toPlainOnly: true,
    },
  );
  const toClass = (target: unknown, key: string) => {
    return Transform(
      ({ obj }) => {
        return valueToBoolean(obj[key]);
      },
      {
        toClassOnly: true,
      },
    )(target, key);
  };
  return function (target: unknown, key: string) {
    toPlain(target, key);
    toClass(target, key);
  };
}

function valueToBoolean(value: unknown) {
  if (typeof value === 'string' && 'true' === value) {
    return true;
  }

  if (typeof value === 'string' && 'false' === value) {
    return false;
  }

  return value;
}
