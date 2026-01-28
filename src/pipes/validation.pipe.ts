/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PipeTransform, Injectable, ArgumentMetadata, HttpStatus, HttpException } from '@nestjs/common';
import { validate,ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ApiResponse } from 'src/common/base/api-response';
@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const formatErrors=this.formatErrors(errors)
    if (errors.length > 0) {
      const response= ApiResponse.error(formatErrors,"Failed",HttpStatus.BAD_REQUEST);
      throw new HttpException(response,HttpStatus.BAD_REQUEST)
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
  private formatErrors(errors: ValidationError[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  errors.forEach(error => {
    if (error.constraints) {
      result[error.property] = Object.values(error.constraints);
    }
  });

  return result;
}

  
}
