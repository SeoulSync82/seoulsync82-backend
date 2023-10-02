import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-naver";

export class JwtNaverStrategy extends PassportStrategy(Strategy, "naver") {
  constructor() {
    super({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: process.env.NAVER_CALLBACK_URL,
    });
  }

  validate(accessToken: string, refreshToken: string, profile: any) {
    // console.log(accessToken);
    // console.log(refreshToken);
    // console.log(profile);

    return {
      name: profile.displayName,
      email: profile._json.email,
      password: profile.id,
    };
  }
}