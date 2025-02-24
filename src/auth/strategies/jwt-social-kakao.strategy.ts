import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { VerifyCallback } from 'passport-google-oauth20';
import { Profile, Strategy } from 'passport-kakao';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class JwtKakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('KAKAO_ID'),
      clientSecret: configService.get('KAKAO_SECRET'),
      callbackURL: configService.get('KAKAO_CALLBACK'),
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
        email: _json.kakao_account.email,
        nickname: _json.properties.nickname,
        photo: _json.properties.profile_image,
      };
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
