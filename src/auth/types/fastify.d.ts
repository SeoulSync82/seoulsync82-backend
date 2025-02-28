import 'fastify';
import { Payload } from 'src/auth/types/jwt.payload';

declare module 'fastify' {
  interface FastifyRequest {
    user?: Payload;
  }
}
