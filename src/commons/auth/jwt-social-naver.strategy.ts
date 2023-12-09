import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-naver';
import { ConfigService } from 'src/config/config.service';
import { Request } from 'express';

@Injectable()
export class JwtNaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('NAVER_ID'), //.env파일에 들어있음
      clientSecret: configService.get('NAVER_SECRET'), //.env파일에 들어있음
      // callbackURL: 'http://localhost:3456/auth/naver/callback', //.env파일에 들어있음
      callbackURL: 'http://staging.seoulsync82.com:3456/auth/naver/callback', //.env파일에 들어있음
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void,
  ) {
    try {
      console.log(profile);
      let state = req.query.state;
      if (typeof state !== 'string') {
        state = ''; // 혹은 적절한 기본값 설정
      }
      const decodedState = state ? JSON.parse(Buffer.from(state, 'base64').toString('utf8')) : {};
      const { _json } = profile;
      const user = {
        email: _json.email,
        nickname: _json.nickname,
        photo: _json.profile_image,
      };
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
