import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-naver';
import { ConfigService } from 'src/config/config.service';
import { isNotEmpty } from '../util/is/is-empty';

@Injectable()
export class JwtNaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('NAVER_ID'),
      clientSecret: configService.get('NAVER_SECRET'),
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
      callbackURL = this.configService.get('NAVER_DEV_CALLBACK');
    } else {
      callbackURL = this.configService.get('NAVER_CALLBACK');
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
