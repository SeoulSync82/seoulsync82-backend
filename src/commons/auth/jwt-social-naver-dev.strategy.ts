import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-naver';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class JwtNaverDevStrategy extends PassportStrategy(Strategy, 'naver-dev') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('NAVER_ID'),
      clientSecret: configService.get('NAVER_SECRET'),
    });
  }

  authenticate(req, options) {
    let callbackURL = this.configService.get('NAVER_DEV_CALLBACK');
    super.authenticate(req, { ...options, callbackURL });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void,
  ) {
    try {
      console.log('naver-success');
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
