import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

type ApiErrorPayload = {
  message?: string | string[];
  errors?: Record<string, string[]> | null;
};

@Catch(HttpException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const raw = exception.getResponse();

    let code = 'UNKNOWN_ERROR';
    let details: Record<string, string[]> | null = null;

    if (typeof raw === 'string') {
      code = raw;
    } else if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      const data = raw as ApiErrorPayload;
      const msg = data.message;
      if (Array.isArray(msg)) {
        code = 'VALIDATION_ERROR';
        details = { _general: msg };
      } else if (typeof msg === 'string') {
        code = msg;
        if (data.errors && typeof data.errors === 'object') {
          details = data.errors;
        }
      }
    }

    res.status(status).json({
      success: false,
      error: {
        code,
        details,
      },
    });
  }
}
