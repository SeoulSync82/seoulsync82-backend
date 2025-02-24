import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ERROR } from 'src/commons/constants/error';
import { ConfigService } from 'src/config/config.service';
import { parseAuthHeader, verifyJWT } from '../../commons/helpers/jwt.helper';
import { isNotEmpty } from '../../commons/util/is/is-empty';
import { Payload } from '../types/jwt.payload';

@Injectable()
export class JwtOptionalAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtOptionalAuthGuard.name);

  constructor(private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authHeader = request.headers.authorization;

    if (isNotEmpty(authHeader)) {
      const auth = parseAuthHeader(authHeader);
      if (auth && auth.scheme.toLowerCase() === 'bearer') {
        try {
          const payload = await verifyJWT<Payload>(auth.value, this.config.get('JWT_SECRET'));
          request['user'] = payload;
        } catch (e) {
          this.logger.error(`Error in JwtOptionalAuthGuard: ${e.message}`, e.stack);
          throw new UnauthorizedException(ERROR.AUTHENTICATION);
        }
      }
    }
    return true;
  }
}
