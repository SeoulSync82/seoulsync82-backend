import { CallHandler, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { customBlancLogger } from 'blanc-logger';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => {
          customBlancLogger.error(`Error.Stack ${err.stack}`);
          return new HttpException({ statusCode: 500, message: err.message }, err.status);
        }),
      ),
    );
  }
}
