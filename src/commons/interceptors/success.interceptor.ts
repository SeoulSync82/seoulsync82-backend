import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { customBlancLogger } from 'blanc-logger';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { createApiResponse } from 'src/commons/helpers/response.helper';

@Injectable()
export class SuccessInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    return next.handle().pipe(
      tap(() => customBlancLogger.log(`Processed ${path} in ${Date.now() - startTime}ms`)),
      map((data) => createApiResponse(data, 200, 'SUCCESS', path)),
    );
  }
}
