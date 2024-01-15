import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { ValidationError } from 'class-validator';
import { FastifyReply, FastifyRequest } from 'fastify';
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
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    // Check if response is already sent
    if (response.sent) {
      this.logger.warn('Response is already sent.');
      return;
    }

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      let errorResponse = {
        status_code: exception.getStatus(),
        status: exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      // Handling for ValidationError
      if (res instanceof ValidationError) {
        errorResponse.status = Object.keys(res.constraints)
          .map((key) => res.constraints[key])
          .join('\n');
      }

      response.status(exception.getStatus()).send(errorResponse);
    } else if (exception instanceof AxiosError) {
      const error = this.axiosErrorHandler(exception);
      response.status(new InternalServerErrorException().getStatus()).send({
        status_code: error.status,
        status: error.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      // Generic error handling
      this.logger.error(`Error.Stack ${(exception as Error).stack}`);
      response.status(new InternalServerErrorException().getStatus()).send({
        status_code: 500,
        status: (exception as Error).message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
