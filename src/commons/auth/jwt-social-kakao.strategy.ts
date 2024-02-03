import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';
import { ConfigService } from 'src/config/config.service';
import { isNotEmpty } from '../util/is/is-empty';

@Injectable()
export class JwtKakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('KAKAO_ID'),
      clientSecret: configService.get('KAKAO_SECRET'),
      // scope: ["account_email", "profile_nickname"],
    });
  }

  authenticate(req, options) {
    const env = req.headers.referer === 'http://localhost:3457/';
    let callbackURL;
    if (isNotEmpty(req.headers.referer) && env === true) {
      callbackURL = this.configService.get('KAKAO_DEV_CALLBACK');
    } else {
      callbackURL = this.configService.get('KAKAO_CALLBACK');
    }

    super.authenticate(req, { ...options, callbackURL });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void,
  ) {
    try {
      console.log(profile);
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
