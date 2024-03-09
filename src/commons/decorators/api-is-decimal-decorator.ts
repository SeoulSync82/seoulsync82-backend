import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';

export function IsStrictDecimal(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrictDecimal',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return (
            typeof value === 'number' &&
            value.toString().includes('.') &&
            value.toString().split('.')[1].length > 0
          );
        },
      },
    });
  };
}
