import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isURL,
} from 'class-validator';

export function IsUrlOrEmpty(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUrlOrEmpty',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: any, _args: ValidationArguments) {
          if (value === '' || value === null || value === undefined)
            return true;
          return isURL(value);
        },
      },
    });
  };
}
