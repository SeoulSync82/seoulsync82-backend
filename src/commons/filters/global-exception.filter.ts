import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resObj = exception.getResponse();
      message =
        typeof resObj === 'object' && resObj !== null
          ? (resObj as any).message || exception.message
          : exception.message;
    } else if (exception instanceof Error) {
      status = new InternalServerErrorException().getStatus();
      message = 'Internal Server Error';
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
    } else {
      status = 500;
      message = 'Unknown error';
    }

    response.status(status).json({
      statusCode: status,
      status: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
