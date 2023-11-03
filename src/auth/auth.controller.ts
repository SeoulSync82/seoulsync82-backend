import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from 'src/commons/auth/google-auth.guard';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { ErrorsInterceptor } from 'src/commons/interceptors/error.interceptor';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { GoogleLoginAuthOutputDto } from './dto/google-login-auth.dto';
import { GoogleRequest, KakaoRequest, NaverRequest } from './interfaces/auth.interface';

@ApiTags('계정')
@Controller()
@UseFilters(SeoulSync82ExceptionFilter)
@UseInterceptors(SuccessInterceptor, ErrorsInterceptor)
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}
  //-----------------------구글 로그인-----------------------------//

  @Get('/user/login/google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() _req: Request) {}

  /* Get Google Auth Callback */
  @Get('/auth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: GoogleRequest,
    @Res() res: Response, // : Promise<GoogleLoginAuthOutputDto>
  ) {
    // res.redirect('http://localhost:3000/auth/test-guard2');
    // return res.send(user);
    const result = await this.authService.googleLogin(req, res);
    return res.json(result);
  }

  //-----------------------카카오 로그인-----------------------------//

  @Get('/user/login/kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth(@Req() _req: Request) {}

  /* Get kakao Auth Callback */
  @Get('/auth/kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthCallback(
    @Req() req: KakaoRequest,
    // @Res({ passthrough: true }) res: Response,
    @Res() res: Response, // : Promise<KakaoLoginAuthOutputDto>
  ) {
    // const { user } = req;
    // console.log(user);
    // return res.send(user);
    const result = await this.authService.kakaoLogin(req, res);
    return res.json(result);
  }

  //-----------------------네이버 로그인-----------------------------//

  @Get('/user/login/naver')
  @UseGuards(AuthGuard('naver'))
  async naverAuth(@Req() _req: Request) {}

  /* Get naver Auth Callback */
  @Get('/auth/naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverAuthCallback(
    @Req() req: NaverRequest,
    @Res() res: Response, // : Promise<NaverLoginAuthOutputDto>
  ) {
    // const { user } = req;
    // console.log(user);
    // return res.send(user);
    // return this.authService.naverLogin(req, res);
    const result = await this.authService.naverLogin(req, res);
    return res.json(result);
  }

  //--------------------------------------------------------------//

  @Post('/user/refresh')
  @ApiOperation({
    summary: '로그인 연장',
    description: '로그인 연장',
  })
  async silentRefresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.silentRefresh(req, res);
  }
}
