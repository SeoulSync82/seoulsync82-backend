import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { blancLogger } from 'blanc-logger';
import * as chalk from 'chalk';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const req = context.switchToHttp().getRequest();
    const decodedUrl = decodeURIComponent(req.url);
    const moduleName = (req as any).moduleName || 'UnknownModule';

    return next.handle().pipe(
      tap(() => {
        const delay = Date.now() - startTime;
        const delayStr =
          delay > 500 ? chalk.bold.red(`${delay}ms 🚨`) : chalk.magenta(`${delay}ms`);
        const message = `Request processed: ${chalk.yellow(req.method)} ${chalk.green(
          decodedUrl,
        )} ${delayStr}`;
        blancLogger.log(message, moduleName);
      }),
    );
  }
}
