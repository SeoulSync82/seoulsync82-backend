import { Injectable, UnauthorizedException } from '@nestjs/common';
import { isEmpty } from 'class-validator';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { generateUUID } from 'src/commons/util/uuid';
import { ConfigService } from 'src/config/config.service';
import { UserDto } from 'src/user/dto/user.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { ERROR } from './constants/error';
import { ApiAuthPostUserLogoutResponseDto } from './dto/api-auth-post-user-logout-response.dto';
import { ApiAuthPostUserRefreshResponseDto } from './dto/api-auth-post-user-refresh-response.dto';
import { GoogleRequest, KakaoRequest, NaverRequest } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  async googleLogin(req: GoogleRequest, res: Response) {
    try {
      req.user.nickname = req.user.firstName + req.user.lastName;
      const { user } = req;
      delete user.lastName;
      delete user.firstName;
      user.type = 'google';

      const access_token = await this.getOrCreateUserAuthFunction(user, res);

      return {
        ok: true,
        access_token,
      };
    } catch (error) {
      throw new UnauthorizedException(ERROR.AUTHENTICATION);
    }
  }

  async kakaoLogin(req: KakaoRequest, res: Response) {
    try {
      req.user.nickname = req.user.nickname;
      const { user } = req;
      user.type = 'kakao';

      const access_token = await this.getOrCreateUserAuthFunction(user, res);

      return {
        ok: true,
        access_token,
      };
    } catch (error) {
      throw new UnauthorizedException(ERROR.AUTHENTICATION);
    }
  }

  async naverLogin(req: NaverRequest, res: Response) {
    try {
      req.user.nickname = req.user.nickname;
      const { user } = req;
      user.type = 'naver';

      const access_token = await this.getOrCreateUserAuthFunction(user, res);

      return {
        ok: true,
        access_token,
      };
    } catch (error) {
      throw new UnauthorizedException(ERROR.AUTHENTICATION);
    }
  }

  async silentRefresh(req: Request, res: Response): Promise<ApiAuthPostUserRefreshResponseDto> {
    try {
      const getRefreshToken = req.cookies['refresh_token'];
      if (isEmpty(getRefreshToken)) {
        throw new UnauthorizedException(ERROR.AUTHENTICATION);
      }
      let userId: string | string[] | null;
      jwt.verify(
        getRefreshToken,
        this.configService.get('JWT_REFRESH_KEY'),
        (err: jwt.VerifyErrors | null, decoded: jwt.JwtPayload | undefined) => {
          if (err) {
            res.clearCookie('refresh_token');
            throw new UnauthorizedException(ERROR.AUTHENTICATION);
          }
          userId = decoded.aud;
        },
      );

      /**  로그아웃 후에는 Silent Refresh를 무시 */
      const loginUser = await this.userQueryRepository.findId(+userId);
      if (loginUser.refresh_token !== getRefreshToken) {
        throw new UnauthorizedException(ERROR.AUTHENTICATION);
      }

      const payload = {
        id: loginUser.id,
        uuid: loginUser.uuid,
        nickname: loginUser.name,
        profile_image: loginUser.profile_image,
      };
      const access_token = jwt.sign(payload, this.configService.get('JWT_SECRET'), {
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      });

      return {
        ok: true,
        access_token,
      };
    } catch (error) {
      throw new UnauthorizedException(ERROR.AUTHENTICATION);
    }
  }

  async logout(user: UserDto, res): Promise<ApiAuthPostUserLogoutResponseDto> {
    try {
      if (isEmpty(user.id)) throw new UnauthorizedException(ERROR.AUTHENTICATION);

      const loginUser = await this.userQueryRepository.findId(user.id);
      loginUser.refresh_token = null;
      await this.userQueryRepository.save(loginUser);
      res.clearCookie('refreshToken');
      return { ok: true };
    } catch (error) {
      throw new UnauthorizedException(ERROR.AUTHENTICATION);
    }
  }

  async getOrCreateUserAuthFunction(user, res: Response) {
    let findUser = await this.userQueryRepository.findUser(user);

    if (!findUser) {
      const uuid = generateUUID();
      findUser = await this.userQueryRepository.createUser(user, uuid);
    }

    const findUserPayload = {
      id: findUser.id,
      uuid: findUser.uuid,
      nickname: findUser.name,
      profile_image: findUser.profile_image,
    };
    const access_token = jwt.sign(findUserPayload, this.configService.get('JWT_SECRET'), {
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
    });
    const refresh_token = jwt.sign({}, this.configService.get('JWT_REFRESH_KEY'), {
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      audience: String(findUser.id),
    });

    findUser.refresh_token = refresh_token;
    await this.userQueryRepository.save(findUser);

    const now = new Date();
    now.setDate(
      now.getDate() + parseInt(this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_DATE')) / 1000,
    );

    res.cookie('refresh_token', refresh_token, {
      expires: now,
      httpOnly: true,
      /** HTTP 환경에서 테스트 중이라 임시로 false 변경 */
      secure: false,
      sameSite: 'none',
    });
    return access_token;
  }
}
