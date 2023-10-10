// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { Cache } from 'cache-manager';
// import { Inject, UnauthorizedException } from '@nestjs/common';
// import { CACHE_MANAGER } from "@nestjs/cache-manager";
// import { ConfigService } from 'src/config/config.service';
// export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
//   constructor(private readonly configService: ConfigService,
//     @Inject(CACHE_MANAGER)
//     private readonly cacheManager: Cache,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: configService.get('JWT_SECRET'),
//       passReqToCallback: true,
//     });
//   }

//   async validate(req, payload) {
//     const access_token = req.headers.authorization.replace('Bearer ', '');

//     const result = await this.cacheManager.get(`access_token:${access_token}`);

//     if (result === 'accessToken') {
//       throw new UnauthorizedException('이미 로그아웃된 토큰입니다.');
//     }

//     return {
//       role: payload.role,
//       id: payload.sub,
//       exp: payload.exp,
//     };
//   }
// }
