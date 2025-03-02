import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { customBlancLogger } from 'blanc-logger';
import * as chalk from 'chalk';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const req = context.switchToHttp().getRequest();
    const moduleName = (req as any).moduleName || 'UnknownModule';

    return next.handle().pipe(
      tap(() => {
        const delay = Date.now() - startTime;
        const message = `Request processed - ${chalk.yellow(req.method)} ${chalk.green(
          req.url,
        )} ${chalk.magenta(`${delay}ms`)}`;
        customBlancLogger.log(message, moduleName);
      }),
    );
  }
}
