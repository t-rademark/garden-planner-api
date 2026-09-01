import { Transform, TransformFnParams } from 'class-transformer';
import { ValidateBy, ValidateIf, ValidationOptions } from 'class-validator';
import { dateOnlyToUtc } from '../utils/date.utils';

export function Trim(): PropertyDecorator {
  return Transform((params: TransformFnParams) => {
    const value: unknown = params.value;
    return typeof value === 'string' ? value.trim() : value;
  });
}

export function ValidateIfPresent(): PropertyDecorator {
  return ValidateIf((_object: object, value: unknown) => value !== undefined);
}

export function ValidateIfPresentAndNotNull(): PropertyDecorator {
  return ValidateIf(
    (_object: object, value: unknown) => value !== undefined && value !== null,
  );
}

export function IsDateOnly(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isDateOnly',
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false;
          }

          try {
            dateOnlyToUtc(value);
            return true;
          } catch {
            return false;
          }
        },
        defaultMessage: () =>
          '$property must be a valid date in YYYY-MM-DD format',
      },
    },
    validationOptions,
  );
}
