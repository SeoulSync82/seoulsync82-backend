import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as JWT from 'jsonwebtoken';
import { FastifyRequest } from 'fastify';
import { isNotEmpty } from '../util/is/is-empty';
import { ConfigDto } from 'src/config/dto/config.dto';
import { Payload } from './jwt.payload';
import { ERROR } from 'src/auth/constants/error';
import { ConfigService } from 'src/config/config.service';

const BEARER_AUTH_SCHEME = 'bearer';
const re = /(\S+)\s+(\S+)/;

function parseAuthHeader(hdrValue: string) {
  if (typeof hdrValue !== 'string') {
    return null;
  }
  const matches = hdrValue.match(re);
  return matches && { scheme: matches[1], value: matches[2] };
}

async function JWTVerify<T>(jwt: string, key: string, options?: JWT.VerifyOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    JWT.verify(jwt, key, options, (err, payload) => {
      if (err) {
        reject(err);
      } else {
        resolve(payload as T);
      }
    });
  });
}

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
          const payload = await JWTVerify<Payload>(auth.value, this.config.get('JWT_SECRET'));
          request['user'] = payload;
        } catch (e) {
          console.error(e.message);
          throw new UnauthorizedException(ERROR.AUTHENTICATION);
        }
      }
    }

    return true;
  }
}
