import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class JwtNaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('NAVER_ID'), //.env파일에 들어있음
      clientSecret: configService.get('NAVER_SECRET'), //.env파일에 들어있음
      callbackURL: 'http://localhost:3456/auth/naver/callback', //.env파일에 들어있음
    });
  }

  validate(accessToken: string, refreshToken: string, profile: any) {
    // console.log(accessToken);
    // console.log(refreshToken);
    // console.log(profile);

    return {
      name: profile.displayName,
      email: profile._json.email,
      password: profile.id,
    };
  }
}
