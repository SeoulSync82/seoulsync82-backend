import { ConsoleLogger, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-kakao";
import { ConfigService } from "src/config/config.service";

@Injectable()
export class JwtKakaoStrategy extends PassportStrategy(Strategy, "kakao") {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('KAKAO_ID'), //.env파일에 들어있음
      clientSecret: configService.get('KAKAO_SECRET'), //.env파일에 들어있음
      callbackURL: 'http://localhost:3456/auth/kakao/callback', //.env파일에 들어있음
      // scope: ["account_email", "profile_nickname"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void,
  ) {
    try {
      console.log(profile)
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