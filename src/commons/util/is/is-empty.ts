import * as FE from 'fp-ts/Either';
import * as FF from 'fp-ts/function';

export function isUndefined<T>(value: T | undefined): value is undefined {
  return value === undefined;
}

export function isNotUndefined<T>(value?: T | undefined): value is T {
  return !isUndefined(value);
}

export function isNull<T>(value?: T | null): value is null {
  return value === null;
}

export function isNotNull<T>(value?: T | null): value is T {
  return !isNull(value);
}

type TSimpleValue<T> = T | null | undefined;

export function isEmptySimple<T>(value: TSimpleValue<T>): value is null | undefined {
  return isUndefined(value) || isNull(value);
}

export function isNotEmptySimple<T>(value: TSimpleValue<T>): value is T {
  return !isEmptySimple(value);
}

export function isEmptyString(value?: string | null | undefined): value is null | undefined {
  return FF.pipe(
    value,
    FE.fromNullable(true),
    FE.map((notNull) => notNull === ''),
    FE.fold(
      (left) => left,
      (right) => right,
    ),
  );
}

export function isNotEmptyString(value?: string | null | undefined): value is string {
  return !isEmptyString(value);
}

export function isEmpty<T>(value?: T | null | undefined): value is null | undefined {
  return FF.pipe(
    value,
    FE.fromNullable(true),
    FE.chain((notNull) => {
      return typeof notNull === 'string' && notNull === '' ? FE.left(true) : FE.right(notNull);
    }),
    FE.chain((notString) => {
      return typeof notString === 'number' && Number.isNaN(notString)
        ? FE.left(true)
        : FE.right(notString);
    }),
    FE.chain((notNumber) => {
      return typeof notNumber === 'object' && Array.isArray(notNumber) && notNumber.length < 1
        ? FE.left(true)
        : FE.right(notNumber);
    }),
    FE.chain((notArray) => {
      return typeof notArray === 'object' &&
        !(notArray instanceof Date) &&
        Object.keys(notArray).length < 1
        ? FE.left(true)
        : FE.right(notArray);
    }),
    FE.fold(
      (left) => left,
      () => false,
    ),
  );
}

export function isNotEmpty<T>(value?: T | null | undefined): value is T {
  return !isEmpty<T>(value);
}
