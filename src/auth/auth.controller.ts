import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request, Response } from "express";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";

interface IOAuthUser {
  user: {
    name: string;
    email: string;
    password: string;
  };
}

@Controller()
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  //-----------------------구글 로그인-----------------------------//
  @Get("/user/login/google")
  @UseGuards(AuthGuard("google"))
  async loginGoogle(
    @Req() req: Request & IOAuthUser,
    @Res() res: Response
  ) {
    this.authService.OAuthLogin({ req, res });
  }

  //-----------------------카카오 로그인-----------------------------//
  @Get("/user/login/kakao")
  @UseGuards(AuthGuard("kakao"))
  async loginKakao(
    @Req() req: Request & IOAuthUser, 
    @Res() res: Response
  ) {
    this.authService.OAuthLogin({ req, res });
  }

  //-----------------------네이버 로그인-----------------------------//
  @Get("/user/login/naver")
  @UseGuards(AuthGuard("naver"))
  async loginNaver(
    @Req() req: Request & IOAuthUser,
    @Res() res: Response
  ) {
    this.authService.OAuthLogin({ req, res });
  }

  @Get("favicon.ico")
  favicon(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response
  ) {
    res.status(204).end();
  }
}