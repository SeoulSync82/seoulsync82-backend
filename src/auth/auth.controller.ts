/* eslint-disable @typescript-eslint/no-empty-function */
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
import passport from 'passport';
import { JwtAuthGuard } from 'src/commons/auth/jwt-auth.guard';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { SeoulSync82ExceptionFilter } from 'src/commons/filters/seoulsync82.exception.filter';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { EnhancedRequest } from './dto/login-cookie-request.dto';
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

  @Get('/user/login/google')
  @ApiOperation({
    summary: '구글 로그인',
    description: '구글 로그인',
  })
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req: Request) {}

  @Get('/auth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: GoogleRequest, @Res() res: Response) {
    try {
      const result = await this.authService.googleLogin(req, res);
      res.redirect(`https://staging.seoulsync82.com:3457/main/?token=${result.eid_access_token}`);
    } catch (error) {
      console.error('Error parsing state:', error);
      res.redirect('/error');
    }
  }

  @Get('/auth/google/dev/callback')
  @UseGuards(AuthGuard('google-dev'))
  async googleDevAuthCallback(@Req() req: GoogleRequest, @Res() res: Response) {
    try {
      const result = await this.authService.googleLogin(req, res);
      res.redirect(`http://localhost:3457/main/?token=${result.eid_access_token}`);
    } catch (error) {
      console.error('Error parsing state:', error);
      res.redirect('/error');
    }
  }

  @Get('/user/login/kakao')
  @ApiOperation({
    summary: '카카오 로그인',
    description: '카카오 로그인',
  })
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth(@Req() _req: Request) {}

  @Get('/auth/kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthCallback(@Req() req: KakaoRequest, @Res() res: Response) {
    try {
      const result = await this.authService.kakaoLogin(req, res);
      res.redirect(`https://staging.seoulsync82.com:3457/main/?token=${result.eid_access_token}`);
    } catch (error) {
      console.error('Error parsing state:', error);
      res.redirect('/error');
    }
  }

  @Get('/auth/kakao/dev/callback')
  @UseGuards(AuthGuard('kakao-dev'))
  async kakaoDevAuthCallback(@Req() req: KakaoRequest, @Res() res: Response) {
    try {
      const result = await this.authService.kakaoLogin(req, res);
      res.redirect(`http://localhost:3457/main/?token=${result.eid_access_token}`);
    } catch (error) {
      console.error('Error parsing state:', error);
      res.redirect('/error');
    }
  }

  @Get('/user/login/naver')
  @UseGuards(AuthGuard('naver'))
  @ApiOperation({
    summary: '네이버 로그인',
    description: '네이버 로그인',
  })
  async naverAuth(@Req() _req: Request) {}

  @Get('/auth/naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverAuthCallback(@Req() req: NaverRequest, @Res() res: Response) {
    try {
      const result = await this.authService.naverLogin(req, res);
      res.redirect(`https://staging.seoulsync82.com:3457/main/?token=${result.eid_access_token}`);
    } catch (error) {
      console.error('Error parsing state:', error);
      res.redirect('/error');
    }
  }

  @Get('/auth/naver/dev/callback')
  @UseGuards(AuthGuard('naver-dev'))
  async naverDevAuthCallback(@Req() req: NaverRequest, @Res() res: Response) {
    try {
      const result = await this.authService.naverLogin(req, res);
      res.redirect(`http://localhost:3457/main/?token=${result.eid_access_token}`);
    } catch (error) {
      console.error('Error parsing state:', error);
      res.redirect('/error');
    }
  }

  @Post('/user/refresh')
  @ApiOperation({
    summary: '로그인 연장',
    description: '로그인 연장',
  })
  async silentRefresh(@Req() req: EnhancedRequest, @Res({ passthrough: true }) res: Response) {
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
