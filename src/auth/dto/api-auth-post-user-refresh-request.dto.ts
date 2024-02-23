import { Request as ExpressRequest } from 'express';

export interface ApiAuthPostUserRefreshRequestDto extends ExpressRequest {
  cookies: Record<string, string>;
}
