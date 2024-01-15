import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
  UnprocessableEntityException,
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

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    // 이미 응답이 전송되었는지 확인
    if (response.sent) {
      this.logger.warn('Response already sent.');
      return;
    }

    switch (exception.constructor) {
      case UnprocessableEntityException:
        if (response.sent) return;
        const res = exception.getResponse();
        if (res instanceof ValidationError) {
          response.status(exception.getStatus()).send({
            status_code: exception.getStatus(),
            status: Object.keys(res.constraints)
              .map((key) => res.constraints[key])
              .join('\n'),
            timestamp: new Date().toISOString(),
            path: request.url,
          });
        } else {
          response.status(exception.getStatus()).send({
            status_code: exception.getStatus(),
            status: exception.message,
            timestamp: new Date().toISOString(),
            path: request.url,
          });
        }
        break;
      case BadRequestException:
      case NotFoundException:
      case ForbiddenException:
      case ConflictException:
      case UnauthorizedException:
        if (response.sent) return;
        response.status(exception.getStatus()).send({
          status_code: exception.getStatus(),
          status: exception.message,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        break;
      case AxiosError:
        if (response.sent) return;
        const axiosError = this.axiosErrorHandler(exception as unknown as AxiosError);
        response.status(new InternalServerErrorException().getStatus()).send({
          status_code: axiosError.status,
          status: axiosError.message,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        break;
      default:
        if (response.sent) return;
        this.logger.error(`Error occurred: ${exception.message}`);
        response.status(new InternalServerErrorException().getStatus()).send({
          status_code: 500,
          status: 'Internal Server Error',
          timestamp: new Date().toISOString(),
          path: request.url,
        });
    }
  }
}
