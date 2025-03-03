import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { blancLogger } from 'blanc-logger';
import { FastifyRequest } from 'fastify';
import { Payload } from 'src/auth/types/jwt.payload';
import { ERROR } from 'src/commons/constants/error';
import { parseAuthHeader, verifyJWT } from 'src/commons/helpers/jwt.helper';
import { isNotEmpty } from 'src/commons/util/is/is-empty';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class JwtOptionalAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authHeader = request.headers.authorization;

    if (isNotEmpty(authHeader)) {
      const auth = parseAuthHeader(authHeader);
      if (auth && auth.scheme.toLowerCase() === 'bearer') {
        try {
          const payload = await verifyJWT<Payload>(auth.value, this.config.get('JWT_SECRET'));
          request.user = payload;
        } catch (e) {
          blancLogger.error(`Error in JwtOptionalAuthGuard: ${e.message}`, {
            moduleName: 'JwtOptionalAuthGuard',
            stack: e.stack,
          });
          throw new UnauthorizedException(ERROR.AUTHENTICATION);
        }
      }
    }
    return true;
  }
}
