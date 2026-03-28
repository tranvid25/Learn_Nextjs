import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const err of errors) {
    const path = parentPath ? `${parentPath}.${err.property}` : err.property;
    if (err.constraints) {
      result[path] = Object.values(err.constraints);
    }
    if (err.children?.length) {
      Object.assign(result, flattenValidationErrors(err.children, path));
    }
  }
  return result;
}

export function validationExceptionFactory(errors: ValidationError[]) {
  const details = flattenValidationErrors(errors);
  return new BadRequestException({
    message: 'VALIDATION_ERROR',
    errors: details,
  });
}
