import { Injectable, ExecutionContext, CallHandler, HttpException, Logger } from '@nestjs/common';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor {
  private readonly logger = new Logger(ErrorsInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => {
          this.logger.error(`Error.Stack ${err.stack}`);
          return new HttpException({ statusCode: 500, message: err.message }, err.status);
        }),
      ),
    );
  }
}
