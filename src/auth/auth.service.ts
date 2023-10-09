import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import {
  IAuthServiceGetAccessToken,
  IAuthServiceSetRefreshToken,
} from "src/auth/interfaces/auth-service.interface";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,  
    private readonly jwtService: JwtService,
    ) {}

    
  async OAuthLogin({ req, res }) {
    // 1. 회원조회
    // let user = await this.userService.findOne({ email: req.user.email }); //user를 찾아서

    // // 2, 회원가입이 안되어있다면? 자동회원가입
    // if (!user) user = await this.userService.create({ ...req.user }); //user가 없으면 하나 만들고, 있으면 이 if문에 들어오지 않을거기때문에 이러나 저러나 user는 존재하는게 됨.

    // // 3. 회원가입이 되어있다면? 로그인(AT, RT를 생성해서 브라우저에 전송)한다
    // this.setRefreshToken({ user, res });
    // res.redirect("리다이렉트할 url주소");
  }
}