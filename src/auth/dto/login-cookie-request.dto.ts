// request.dto.ts
import { Request as ExpressRequest } from 'express';

export interface EnhancedRequest extends ExpressRequest {
  cookies: Record<string, string>;
  // 여기에 더 많은 사용자 정의 속성을 추가할 수 있습니다.
}
