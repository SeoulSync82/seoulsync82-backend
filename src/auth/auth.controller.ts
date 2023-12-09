import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { ErrorsInterceptor } from 'src/commons/interceptors/error.interceptor';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { RequestWithUser } from 'src/commons/interfaces/common.interface';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { GoogleLoginAuthOutputDto } from './dto/google-login-auth.dto';
import { LogoutAuthOutputDto } from './dto/logout.dto';
import { GoogleRequest, KakaoRequest, NaverRequest } from './interfaces/auth.interface';

@ApiTags('계정')
@Controller()
@UseFilters(SeoulSync82ExceptionFilter)
@UseInterceptors(SuccessInterceptor)
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}
  //-----------------------구글 로그인-----------------------------//

  @Get('/user/login/google')
  @ApiOperation({
    summary: '구글 로그인',
    description: '구글 로그인',
  })
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req: Request) {}

  /* Get Google Auth Callback */
  @Get('/auth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: GoogleRequest,
    @Res() res: Response,
    @Query('state') state: string,
  ) {
    try {
      const result = await this.authService.googleLogin(req, res);

      const env = JSON.parse(decodeURIComponent(state)).env;
      const frontendUrl =
        env === 'staging'
          ? 'http://staging.seoulsync82.com:3457/main'
          : 'http://localhost:3457/main';

      console.log('frontendUrl', frontendUrl);
      console.log('env', env);

      res.redirect(`${frontendUrl}/?token=${result.eid_access_token}`);
    } catch (error) {
      res.redirect('/error');
    }
  }
  //-----------------------카카오 로그인-----------------------------//

  @Get('/user/login/kakao')
  @ApiOperation({
    summary: '카카오 로그인',
    description: '카카오 로그인',
  })
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth(@Req() _req: Request) {}

  /* Get kakao Auth Callback */
  @Get('/auth/kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthCallback(
    @Req() req: KakaoRequest,
    @Res() res: Response,
    @Query('state') state: string,
  ) {
    try {
      const result = await this.authService.kakaoLogin(req, res);

      const env = JSON.parse(decodeURIComponent(state)).env;
      const frontendUrl =
        env === 'staging'
          ? 'http://staging.seoulsync82.com:3457/main'
          : 'http://localhost:3457/main';

      res.redirect(`${frontendUrl}/?token=${result.eid_access_token}`);
    } catch (error) {
      res.redirect('/error');
    }
  }

  //-----------------------네이버 로그인-----------------------------//

  @Get('/user/login/naver')
  @ApiOperation({
    summary: '네이버 로그인',
    description: '네이버 로그인',
  })
  @UseGuards(AuthGuard('naver'))
  async naverAuth(@Req() _req: Request) {}

  /* Get naver Auth Callback */
  @Get('/auth/naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverAuthCallback(
    @Req() req: NaverRequest,
    @Res() res: Response,
    @Query('state') state: string,
  ) {
    try {
      const result = await this.authService.naverLogin(req, res);

      const env = JSON.parse(decodeURIComponent(state)).env;
      const frontendUrl =
        env === 'staging'
          ? 'http://staging.seoulsync82.com:3457/main'
          : 'http://localhost:3457/main';

      res.redirect(`${frontendUrl}/?token=${result.eid_access_token}`);
    } catch (error) {
      res.redirect('/error');
    }
  }

  //--------------------------------------------------------------//

  @Post('/user/refresh')
  @ApiOperation({
    summary: '로그인 연장',
    description: '로그인 연장',
  })
  async silentRefresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.authService.silentRefresh(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('user/logout')
  @ApiOperation({
    summary: '로그아웃',
    description: '로그아웃',
  })
  async logout(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user,
  ): Promise<LogoutAuthOutputDto> {
    return await this.authService.logout(user, res);
  }
}
