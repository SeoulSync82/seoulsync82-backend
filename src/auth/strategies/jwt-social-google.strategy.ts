import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class JwtGoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_ID'),
      clientSecret: configService.get('GOOGLE_SECRET'),
      scope: ['email', 'profile'],
      callbackURL: configService.get('GOOGLE_CALLBACK'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    try {
      const { name, emails, photos } = profile;
      const user = {
        email: emails[0].value,
        nickname: `${name.familyName}${name.givenName}`.trim(),
        photo: photos[0].value,
      };
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
