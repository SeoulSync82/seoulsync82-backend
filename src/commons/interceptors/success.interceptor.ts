import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable()
export class SuccessInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SuccessInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.logger.log('Before...');

    const now = Date.now();
    return next.handle().pipe(
      tap(() => this.logger.log(`After... ${Date.now() - now}ms`)), // post-request
      map((data) => ({
        // status_code: 200,
        status: 'SUCCESS',
        data: { ...data },
      })),
    );
  }
}
