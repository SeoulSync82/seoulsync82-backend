import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { customBlancLogger } from 'blanc-logger';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { ApiAuthPostUserLogoutResponseDto } from 'src/auth/dto/api-auth-post-user-logout-response.dto';
import { ApiAuthPostUserRefreshRequestDto } from 'src/auth/dto/api-auth-post-user-refresh-request.dto';
import { ApiAuthPostUserRefreshResponseDto } from 'src/auth/dto/api-auth-post-user-refresh-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GoogleRequest, KakaoRequest, NaverRequest } from 'src/auth/interfaces/auth.interface';
import { ERROR } from 'src/commons/constants/error';
import { ApiExceptionResponse } from 'src/commons/decorators/api-exception-response.decorator';
import { ApiSuccessResponse } from 'src/commons/decorators/api-success-response.decorator';
import { CurrentUser } from 'src/commons/decorators/user.decorator';
import { getFrontendUrl } from 'src/commons/helpers/frontend-redirect.helper';
import { ConfigService } from 'src/config/config.service';
import { UserDto } from 'src/user/dto/user.dto';

@ApiTags('계정')
@Controller('/api/auth')
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /** 소셜 로그인 Callback 처리 메서드 */
  private async handleSocialLoginCallback(req: Request, res: Response, provider: string) {
    try {
      const result = await this.authService.handleSocialLogin(req, res, provider);
      const frontendUrl = getFrontendUrl(req.headers.referer || '', this.configService);

      customBlancLogger.log(`${provider} login success for [${req.user}]`, 'AuthService');
      res.redirect(`${frontendUrl}/?token=${result.access_token}`);
    } catch (e) {
      customBlancLogger.error(
        `Error in ${provider} login for [${req.user}]: ${e.message}`,
        e.stack,
      );
      throw new UnauthorizedException(ERROR.AUTHENTICATION);
    }
  }

  @Get('/login/google')
  @ApiOperation({
    summary: '구글 로그인',
    description: '구글 로그인 요청',
  })
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req: Request) {}

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: '구글 로그인 콜백',
    description: 'referer를 기반으로 프론트엔드 리다이렉션 URL을 결정',
  })
  @ApiExceptionResponse([ERROR.AUTHENTICATION], {
    description: '구글 로그인 실패',
    status: HttpStatus.UNAUTHORIZED,
  })
  async googleCallback(@Req() req: GoogleRequest, @Res() res: Response) {
    return this.handleSocialLoginCallback(req, res, 'google');
  }

  @Get('/login/kakao')
  @ApiOperation({
    summary: '카카오 로그인',
    description: '카카오 로그인 요청',
  })
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth(@Req() _req: Request) {}

  @Get('/kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({
    summary: '카카오 로그인 콜백',
    description: 'referer를 기반으로 프론트엔드 리다이렉션 URL을 결정',
  })
  @ApiExceptionResponse([ERROR.AUTHENTICATION], {
    description: '카카오 로그인 실패',
    status: HttpStatus.UNAUTHORIZED,
  })
  async kakaoCallback(@Req() req: KakaoRequest, @Res() res: Response) {
    return this.handleSocialLoginCallback(req, res, 'kakao');
  }

  @Get('/login/naver')
  @UseGuards(AuthGuard('naver'))
  @ApiOperation({
    summary: '네이버 로그인',
    description: '네이버 로그인',
  })
  async naverAuth(@Req() _req: Request) {}

  @Get('/naver/callback')
  @UseGuards(AuthGuard('naver'))
  @ApiOperation({
    summary: '네이버 로그인 콜백',
    description: 'referer를 기반으로 프론트엔드 리다이렉션 URL을 결정',
  })
  @ApiExceptionResponse([ERROR.AUTHENTICATION], {
    description: '네이버 로그인 실패',
    status: HttpStatus.UNAUTHORIZED,
  })
  @UseGuards(AuthGuard('naver'))
  async naverCallback(@Req() req: NaverRequest, @Res() res: Response) {
    return this.handleSocialLoginCallback(req, res, 'naver');
  }

  @Post('/refresh')
  @ApiOperation({
    summary: '로그인 연장',
    description: '토큰 리프레시',
  })
  @ApiSuccessResponse(ApiAuthPostUserRefreshResponseDto, {
    description: '로그인 연장 성공',
    status: HttpStatus.CREATED,
  })
  @ApiExceptionResponse([ERROR.AUTHENTICATION], {
    description: '로그인 연장 실패',
    status: HttpStatus.UNAUTHORIZED,
  })
  async silentRefresh(
    @Req() req: ApiAuthPostUserRefreshRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiAuthPostUserRefreshResponseDto> {
    return this.authService.silentRefresh(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('/logout')
  @ApiOperation({
    summary: '로그아웃',
    description: '로그아웃 요청',
  })
  @ApiSuccessResponse(ApiAuthPostUserLogoutResponseDto, {
    description: '로그아웃 성공',
    status: HttpStatus.CREATED,
  })
  @ApiExceptionResponse([ERROR.AUTHENTICATION], {
    description: '로그아웃 실패',
    status: HttpStatus.UNAUTHORIZED,
  })
  async logout(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: UserDto,
  ): Promise<ApiAuthPostUserLogoutResponseDto> {
    return this.authService.logout(user, res);
  }
}
