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
    });
  }

  authenticate(req, options) {
    const referer = req.headers.referer?.endsWith('/')
      ? req.headers.referer.slice(0, -1)
      : req.headers.referer;

    const localReferer1 = this.configService.get('SEOULSYNC82_FRONTEND_LOCAL');
    const localReferer2 = this.configService.get('SEOULSYNC82_FRONTEND_LOCAL_SUB');

    const env = referer?.startsWith(localReferer1) || referer?.startsWith(localReferer2);
    let callbackURL;
    if (isNotEmpty(referer) && env === true) {
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
