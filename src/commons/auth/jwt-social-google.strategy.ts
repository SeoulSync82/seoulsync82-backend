import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { ConfigService } from "src/config/config.service";

@Injectable()
export class JwtGoogleStrategy extends PassportStrategy(Strategy, "google") {
  //UseGuards의 이름과 동일해야함
  constructor(private readonly configService: ConfigService) {
    // console.log(configService)
    console.log(33333333333333333333333)
    super({
      //자식의 constructor를 부모의 constructor에 넘기는 방법은 super를 사용하면 된다.
      clientID: configService.get('GOOGLE_ID'), //.env파일에 들어있음
      clientSecret: configService.get('GOOGLE_SECRET'), //.env파일에 들어있음
      callbackURL: 'http://localhost:3456/auth/google/callback', //.env파일에 들어있음
      scope: ["email", "profile"],
    });
    console.log(33333333333333333333333)
  }
  
  validate(accessToken, refreshToken, profile) {
    // console.log(accessToken);
    // console.log(refreshToken);
    // console.log(profile);

    return {
      name: profile.displayName,
      email: profile.emails[0].value,
      hashedPassword: "1234",
    };
  }
}