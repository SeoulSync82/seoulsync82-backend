import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from 'src/config/config.service';
import { isNotEmpty } from '../util/is/is-empty';

@Injectable()
export class JwtGoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_ID'),
      clientSecret: configService.get('GOOGLE_SECRET'),
      scope: ['email', 'profile'],
    });
  }

  authenticate(req, options) {
    const env = req.headers.referer === 'http://localhost:3000/';
    let callbackURL;
    if (isNotEmpty(req.headers.referer) && env === true) {
      callbackURL = this.configService.get('GOOGLE_DEV_CALLBACK');
    } else {
      callbackURL = this.configService.get('GOOGLE_CALLBACK');
    }

    super.authenticate(req, { ...options, callbackURL });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    console.log(profile);
    try {
      const { name, emails, photos } = profile;
      const user = {
        email: emails[0].value,
        firstName: name.familyName,
        lastName: name.givenName,
        photo: photos[0].value,
      };
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
