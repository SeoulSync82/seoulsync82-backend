import { CallHandler, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { blancLogger } from 'blanc-logger';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const moduleName = (req as any).moduleName || 'UnknownModule';

    return next.handle().pipe(
      catchError((e) =>
        throwError(() => {
          blancLogger.error(`Error.Stack ${e.stack},`, {
            moduleName,
            stack: e.stack,
          });
          return new HttpException({ statusCode: 500, message: e.message }, e.status);
        }),
      ),
    );
  }
}
