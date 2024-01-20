import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class JwtGoogleDevStrategy extends PassportStrategy(Strategy, 'google-dev') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_ID'), //.env파일에 들어있음
      clientSecret: configService.get('GOOGLE_SECRET'), //.env파일에 들어있음
      scope: ['email', 'profile'],
    });
  }

  authenticate(req, options) {
    let callbackURL = this.configService.get('GOOGLE_DEV_CALLBACK');
    super.authenticate(req, { ...options, callbackURL });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    console.log('google-success');
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
