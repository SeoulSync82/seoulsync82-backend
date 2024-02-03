import { Request as ExpressRequest } from 'express';

export interface EnhancedRequest extends ExpressRequest {
  cookies: Record<string, string>;
}
