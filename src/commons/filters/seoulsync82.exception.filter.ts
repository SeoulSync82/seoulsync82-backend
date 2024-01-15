import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { Request, Response } from 'express';
import { isNotEmpty } from '../util/is/is-empty';

@Catch(Error)
@Catch(HttpException)
export class SeoulSync82ExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SeoulSync82ExceptionFilter.name);

  axiosErrorHandler(error: AxiosError) {
    const { request, response } = error;
    if (isNotEmpty(response)) {
      const message = response.data;
      const status = response.status;
      return {
        message,
        status,
      };
    } else if (isNotEmpty(request)) {
      return {
        message: 'Axios server time out',
        status: 503,
      };
    } else {
      return { message: 'Axios Error', status: 500 };
    }
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (response.headersSent) {
      this.logger.warn('Response already sent.');
      return;
    }

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      const status = exception.getStatus();

      let message = 'An error occurred'; // 기본 메시지 설정
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        // 'message' 속성이 있는지 안전하게 확인
        const responseObj = exceptionResponse as { message?: string };
        message = responseObj.message || 'An error occurred';
      } else if (typeof exceptionResponse === 'string') {
        // exceptionResponse가 문자열인 경우
        message = exceptionResponse;
      }

      response.status(status).json({
        status_code: status,
        status: message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else if (exception instanceof AxiosError) {
      const axiosError = this.axiosErrorHandler(exception);
      response.status(axiosError.status).json({
        status_code: axiosError.status,
        status: axiosError.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else if (exception instanceof Error) {
      this.logger.error(`Error occurred: ${exception.message}`);
      response.status(new InternalServerErrorException().getStatus()).json({
        status_code: 500,
        status: 'Internal Server Error',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
