import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER, Inject, UnauthorizedException } from '@nestjs/common';

export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: (req) => {
        const cookie = req.headers.cookie;
        const refreshToken = cookie.replace('refreshToken=', '');
        return refreshToken;
      },
      secretOrKey: process.env.JWT_REFRESH_KEY,
      passReqToCallback: true,
    });
  }
  async validate(req, payload) {
    const refresh_token = req.headers.cookie.replace('refreshToken=', '');

    const result = await this.cacheManager.get(
      `refresh_token:${refresh_token}`,
    );
    if (result) {
      throw new UnauthorizedException('로그아웃된 토큰입니다.');
    }

    return {
      role: payload.role,
      id: payload.sub,
      exp: payload.exp,
    };
  }
}