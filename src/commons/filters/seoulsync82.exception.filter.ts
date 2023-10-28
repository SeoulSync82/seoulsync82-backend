import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

/*
  @Catch(HttpException)은
  http 통신의 예외를 캐치하겠다는 뜻입니다.
  만약 모든 예외를 캐치하고 싶다면

  @Catch()로 적용하시면 됩니다.
*/
@Catch(HttpException)
export class SeoulSync82ExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const error = exception.getResponse() as
      | string
      | {
          statusCode: number;
          error: string;
          status: number;
          message: string | string[];
        };
    if (typeof error === 'string') {
      // custom error
      response.status(status).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        path: request.url,
        error,
      });
    } else {
      response.send({
        status_code: error.statusCode,
        status: error.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
