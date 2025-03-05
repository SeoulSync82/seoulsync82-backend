import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { blancLogger } from 'blanc-logger';
import { Request, Response } from 'express';

interface ExceptionResponse {
  status: number;
  message: string;
  stack?: string;
}

/** 예외 객체를 처리하여 상태, 메시지, 스택을 반환하는 함수 */
const handleException = (exception: unknown, _request: Request): ExceptionResponse => {
  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    const res = exception.getResponse();
    const message =
      typeof res === 'object' && res !== null
        ? (res as any).message ?? exception.message
        : exception.message;
    return {
      status,
      message: `HTTP Exception: ${message}`,
      stack: exception instanceof Error ? exception.stack : '',
    };
  }
  if (exception instanceof Error) {
    const status = new InternalServerErrorException().getStatus();
    return {
      status,
      message: `Unhandled exception: ${exception.message}`,
      stack: exception.stack,
    };
  }
  return { status: 500, message: 'Unknown error' };
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const moduleName = (request as any)?.moduleName ?? 'Global';
    const { status, message, stack } = handleException(exception, request);

    blancLogger.error(message, {
      moduleName,
      path: request.url,
      stack,
    });

    response.status(status).json({
      statusCode: status,
      status: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
