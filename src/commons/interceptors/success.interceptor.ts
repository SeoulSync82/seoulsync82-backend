import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { createApiResponse } from 'src/commons/helpers/response.helper';

@Injectable()
export class SuccessInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SuccessInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    return next.handle().pipe(
      tap(() => this.logger.log(`Processed ${path} in ${Date.now() - startTime}ms`)),
      map((data) => createApiResponse(data, 200, 'SUCCESS', path)),
    );
  }
}
