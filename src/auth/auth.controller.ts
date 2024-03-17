/* eslint-disable @typescript-eslint/no-empty-function */
import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
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
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { ConfigService } from 'src/config/config.service';
import { UserDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { ApiAuthPostUserLogoutResponseDto } from './dto/api-auth-post-user-logout-response.dto';
import { ApiAuthPostUserRefreshRequestDto } from './dto/api-auth-post-user-refresh-request.dto';
import { GoogleRequest, KakaoRequest, NaverRequest } from './interfaces/auth.interface';
import { ERROR } from './constants/error';
import { ApiExceptionResponse } from 'src/commons/decorators/api-exception-response.decorator';

@ApiTags('계정')
@Controller()
@UseFilters(SeoulSync82ExceptionFilter)
@UseInterceptors(SuccessInterceptor)
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/api/user/login/google')
  @ApiOperation({
    summary: '구글 로그인',
    description: '구글 로그인',
  })
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req: Request) {}

  @Get('/api/auth/google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiExceptionResponse([ERROR.AUTHENTICATION], {
    description: '구글 로그인 실패',
    status: HttpStatus.UNAUTHORIZED,
  })
  async googleAuthCallback(@Req() req: GoogleRequest, @Res() res: Response) {
    try {
      const result = await this.authService.googleLogin(req, res);
      const frontendUrl = this.configService.get('SEOULSYNC82_FRONTEND_STAGING');
      res.redirect(`${frontendUrl}/?token=${result.access_token}`);
    } catch (error) {
      throw new UnauthorizedException(ERROR.AUTHENTICATION);
    }
  }

  @Get('/api/auth/google/dev/callback')
  @UseGuards(AuthGuard('google-dev'))
  @ApiExceptionResponse([ERROR.AUTHENTICATION], {
    description: '구글 로그인 실패',
    status: HttpStatus.UNAUTHORIZED,
  })
  async googleDevAuthCallback(@Req() req: GoogleRequest, @Res() res: Response) {
    try {
      const result = await this.authService.googleLogin(req, res);
      const frontendUrl = this.configService.get('SEOULSYNC82_FRONTEND_LOCAL');
      res.redirect(`${frontendUrl}/?token=${result.access_token}`);
    } catch (error) {
      throw new UnauthorizedException(ERROR.AUTHENTICATION);
    }
  }

  @Get('/api/user/login/kakao')
  @ApiOperation({
    summary: '카카오 로그인',
    description: '카카오 로그인',
  })
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth(@Req() _req: Request) {}

  @Get('/api/auth/kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  @ApiExceptionResponse([ERROR.AUTHENTICATION], {
    description: '카카오 로그인 실패',
    status: HttpStatus.UNAUTHORIZED,
  })
  async kakaoAuthCallback(@Req() req: KakaoRequest, @Res() res: Response) {
    try {
      const result = await this.authService.kakaoLogin(req, res);
      const frontendUrl = this.configService.get('SEOULSYNC82_FRONTEND_STAGING');
      res.redirect(`${frontendUrl}/?token=${result.access_token}`);
    } catch (error) {
      throw new UnauthorizedException(ERROR.AUTHENTICATION);
    }
  }

  @Get('/api/auth/kakao/dev/callback')
  @UseGuards(AuthGuard('kakao-dev'))
  @ApiExceptionResponse([ERROR.AUTHENTICATION], {
    description: '카카오 로그인 실패',
    status: HttpStatus.UNAUTHORIZED,
  })
  async kakaoDevAuthCallback(@Req() req: KakaoRequest, @Res() res: Response) {
    try {
      const result = await this.authService.kakaoLogin(req, res);
      const frontendUrl = this.configService.get('SEOULSYNC82_FRONTEND_LOCAL');
      res.redirect(`${frontendUrl}/?token=${result.access_token}`);
    } catch (error) {
      throw new UnauthorizedException(ERROR.AUTHENTICATION);
    }
  }

  @Get('/api/user/login/naver')
  @UseGuards(AuthGuard('naver'))
  @ApiOperation({
    summary: '네이버 로그인',
    description: '네이버 로그인',
  })
  async naverAuth(@Req() _req: Request) {}

  @Get('/api/auth/naver/callback')
  @UseGuards(AuthGuard('naver'))
  @ApiExceptionResponse([ERROR.AUTHENTICATION], {
    description: '네이버 로그인 실패',
    status: HttpStatus.UNAUTHORIZED,
  })
  async naverAuthCallback(@Req() req: NaverRequest, @Res() res: Response) {
    try {
      const result = await this.authService.naverLogin(req, res);
      const frontendUrl = this.configService.get('SEOULSYNC82_FRONTEND_STAGING');
      res.redirect(`${frontendUrl}/?token=${result.access_token}`);
    } catch (error) {
      throw new UnauthorizedException(ERROR.AUTHENTICATION);
    }
  }

  @Get('/api/auth/naver/dev/callback')
  @UseGuards(AuthGuard('naver-dev'))
  @ApiExceptionResponse([ERROR.AUTHENTICATION], {
    description: '네이버 로그인 실패',
    status: HttpStatus.UNAUTHORIZED,
  })
  async naverDevAuthCallback(@Req() req: NaverRequest, @Res() res: Response) {
    try {
      const result = await this.authService.naverLogin(req, res);
      const frontendUrl = this.configService.get('SEOULSYNC82_FRONTEND_LOCAL');
      res.redirect(`${frontendUrl}/?token=${result.access_token}`);
    } catch (error) {
      throw new UnauthorizedException(ERROR.AUTHENTICATION);
    }
  }

  @Post('/api/user/refresh')
  @ApiOperation({
    summary: '로그인 연장',
    description: '로그인 연장',
  })
  @ApiExceptionResponse([ERROR.AUTHENTICATION], {
    description: '로그인 연장 실패',
    status: HttpStatus.UNAUTHORIZED,
  })
  async silentRefresh(
    @Req() req: ApiAuthPostUserRefreshRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.silentRefresh(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('/api/user/logout')
  @ApiOperation({
    summary: '로그아웃',
    description: '로그아웃',
  })
  @ApiExceptionResponse([ERROR.AUTHENTICATION], {
    description: '로그아웃 실패',
    status: HttpStatus.UNAUTHORIZED,
  })
  async logout(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: UserDto,
  ): Promise<ApiAuthPostUserLogoutResponseDto> {
    return await this.authService.logout(user, res);
  }
}
