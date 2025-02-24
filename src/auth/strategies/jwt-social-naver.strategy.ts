import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { VerifyCallback } from 'passport-google-oauth20';
import { Profile, Strategy } from 'passport-naver';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class JwtNaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('NAVER_ID'),
      clientSecret: configService.get('NAVER_SECRET'),
      callbackURL: configService.get('NAVER_CALLBACK'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    try {
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
