import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";

export class JwtGoogleStrategy extends PassportStrategy(Strategy, "google") {
  //UseGuards의 이름과 동일해야함
  constructor() {
    //constructor에서 성공하면 아래의 validate로 넘겨주고, 만약 실패하면 멈춰지고 에러 반환
    super({
      //자식의 constructor를 부모의 constructor에 넘기는 방법은 super를 사용하면 된다.
      clientID: process.env.GOOGLE_CLIENT_ID, //.env파일에 들어있음
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, //.env파일에 들어있음
      callbackURL: process.env.GOOGLE_CALLBACK_URL, //.env파일에 들어있음
      scope: ["email", "profile"],
    });
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