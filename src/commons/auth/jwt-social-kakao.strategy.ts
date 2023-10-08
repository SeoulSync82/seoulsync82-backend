import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-kakao";
import { ConfigService } from "src/config/config.service";

@Injectable()
export class JwtKakaoStrategy extends PassportStrategy(Strategy, "kakao") {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('KAKAO_ID'), //.env파일에 들어있음
      clientSecret: configService.get('KAKAO_SECRET'), //.env파일에 들어있음
      callbackURL: 'http://localhost:3456/auth/kakao/callback', //.env파일에 들어있음
      scope: ["account_email", "profile_nickname"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // console.log('accessToken'+accessToken)
    // console.log('refreshToken'+refreshToken)
    // console.log(profile)
    // console.log(profile._json.kakao_account.email)
// 
    return {
      name: profile.displayName,
      email: profile._json.kakao_account.email,
      password: profile.id,
    };
  }
}