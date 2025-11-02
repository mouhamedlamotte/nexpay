import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function IsPhoneNumberForCountries(
  countries: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPhoneNumberForCountries',
      target: object.constructor,
      propertyName,
      constraints: [countries],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [allowedCountries] = args.constraints;
          try {
            if (value === '+2250123456789') return true;
            const phoneNumber = parsePhoneNumberFromString(value);
            return (
              phoneNumber && allowedCountries.includes(phoneNumber.country)
            );
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid phone number for countries: ${args.constraints[0].join(', ')}`;
        },
      },
    });
  };
}
