import { Injectable, UnauthorizedException } from '@nestjs/common';
import { blancLogger } from 'blanc-logger';
import { isEmpty } from 'class-validator';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { ApiAuthPostUserLogoutResponseDto } from 'src/auth/dto/api-auth-post-user-logout-response.dto';
import { ApiAuthPostUserRefreshResponseDto } from 'src/auth/dto/api-auth-post-user-refresh-response.dto';
import { ERROR } from 'src/commons/constants/error';
import { verifyJWT } from 'src/commons/helpers/jwt.helper';
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshCookie,
} from 'src/commons/helpers/token.helper';
import { generateUUID } from 'src/commons/util/uuid';
import { ConfigService } from 'src/config/config.service';
import { UserDto } from 'src/user/dto/user.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  async handleSocialLogin(
    req: Request,
    res: Response,
    provider: string,
  ): Promise<{ access_token: string }> {
    try {
      const user = req.user as any;
      user.type = provider;
      return await this.getOrCreateUserAuth(user, res);
    } catch (e) {
      blancLogger.error(`Error in handleSocialLogin for ${provider} : [${req.user}]`, {
        moduleName: 'AuthService',
        stack: e.stack,
      });
      throw new UnauthorizedException(ERROR.AUTHENTICATION);
    }
  }

  async silentRefresh(req: Request, res: Response): Promise<ApiAuthPostUserRefreshResponseDto> {
    try {
      const refreshToken = req.cookies.refresh_token;
      if (isEmpty(refreshToken)) {
        throw new UnauthorizedException(ERROR.AUTHENTICATION);
      }

      const decoded = await verifyJWT<jwt.JwtPayload>(
        refreshToken,
        this.configService.get('JWT_REFRESH_KEY'),
      );

      const userId = decoded.aud;
      if (!userId) {
        res.clearCookie('refresh_token');
        throw new UnauthorizedException(ERROR.AUTHENTICATION);
      }

      /** 로그아웃 후에는 Silent Refresh를 무시 */
      const loginUser = await this.userQueryRepository.findId(+userId);
      if (loginUser.refresh_token !== refreshToken) {
        throw new UnauthorizedException(ERROR.AUTHENTICATION);
      }

      const payload = {
        id: loginUser.id,
        uuid: loginUser.uuid,
        nickname: loginUser.name,
        profile_image: loginUser.profile_image,
      };
      const accessToken = generateAccessToken(payload, this.configService);

      return {
        ok: true,
        access_token: accessToken,
      };
    } catch (e) {
      blancLogger.error(`Error in silentRefresh: ${e.message}`, {
        moduleName: 'AuthService',
        stack: e.stack,
      });
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
    } catch (e) {
      blancLogger.error(`Error in logout for user [${user}]: ${e.message}`, {
        moduleName: 'AuthService',
        stack: e.stack,
      });
      throw new UnauthorizedException(ERROR.AUTHENTICATION);
    }
  }

  async getOrCreateUserAuth(user, res: Response): Promise<{ access_token: string }> {
    let findUser = await this.userQueryRepository.findUser(user);
    if (isEmpty(findUser)) {
      const uuid = generateUUID();
      findUser = await this.userQueryRepository.createUser(user, uuid);
    }

    const payload = {
      id: findUser.id,
      uuid: findUser.uuid,
      nickname: findUser.name,
      profile_image: findUser.profile_image,
    };

    const accessToken = generateAccessToken(payload, this.configService);
    const refreshToken = generateRefreshToken(findUser.id, this.configService);

    findUser.refresh_token = refreshToken;
    await this.userQueryRepository.save(findUser);

    setRefreshCookie(res, refreshToken, this.configService);

    return { access_token: accessToken };
  }
}
