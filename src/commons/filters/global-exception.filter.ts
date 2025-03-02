import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { blancLogger } from 'blanc-logger';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const moduleName = (request as any).moduleName || 'Global';

    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resObj = exception.getResponse();
      message =
        typeof resObj === 'object' && resObj !== null
          ? (resObj as any).message || exception.message
          : exception.message;
      blancLogger.error(`HTTP Exception: ${message}`, {
        moduleName,
        path: request.url,
        stack: exception instanceof Error ? exception.stack : '',
      });
    } else if (exception instanceof Error) {
      status = new InternalServerErrorException().getStatus();
      message = 'Internal Server Error';
      blancLogger.error(`Unhandled exception: ${exception.message}`, {
        moduleName,
        path: request.url,
        stack: exception.stack,
      });
    } else {
      status = 500;
      message = 'Unknown error';
      blancLogger.error(`Unknown exception: ${JSON.stringify(exception)}`, {
        moduleName,
        path: request.url,
      });
    }

    response.status(status).json({
      statusCode: status,
      status: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
