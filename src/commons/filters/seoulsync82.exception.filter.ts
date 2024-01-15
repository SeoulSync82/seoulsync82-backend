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

/*
  @Catch(HttpException)은
  http 통신의 예외를 캐치하겠다는 뜻입니다.
  만약 모든 예외를 캐치하고 싶다면

  @Catch()로 적용하시면 됩니다.
*/
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

    switch (exception.constructor) {
      case UnprocessableEntityException:
        const res = exception.getResponse() as ValidationError;
        if (res.constructor === ValidationError) {
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
      case HttpException:
      case BadRequestException:
      case NotFoundException:
      case ForbiddenException:
      case ConflictException:
      case UnauthorizedException:
        response.status(exception.getStatus()).send({
          status_code: exception.getStatus(),
          status: exception.message,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        break;
      case AxiosError:
        const error = this.axiosErrorHandler(exception as unknown as AxiosError);
        response.status(new InternalServerErrorException().getStatus()).send({
          status_code: error.status,
          status: error.message,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        break;
      default:
        this.logger.error(`Error.Stack ${exception.stack}`);
        response.status(new InternalServerErrorException().getStatus()).send({
          status_code: 500,
          status: exception.message,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
    }
  }
}
