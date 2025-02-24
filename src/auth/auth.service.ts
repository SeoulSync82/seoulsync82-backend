import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { isEmpty } from 'class-validator';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { generateUUID } from 'src/commons/util/uuid';
import { ConfigService } from 'src/config/config.service';
import { UserDto } from 'src/user/dto/user.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { ERROR } from '../commons/constants/error';
import { verifyJWT } from '../commons/helpers/jwt.helper';
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshCookie,
} from '../commons/helpers/token.helper';
import { ApiAuthPostUserLogoutResponseDto } from './dto/api-auth-post-user-logout-response.dto';
import { ApiAuthPostUserRefreshResponseDto } from './dto/api-auth-post-user-refresh-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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
      this.logger.error(`Error in handleSocialLogin for ${provider} : [${req.user}]`, e.stack);
      throw new UnauthorizedException(ERROR.AUTHENTICATION);
    }
  }

  async silentRefresh(req: Request, res: Response): Promise<ApiAuthPostUserRefreshResponseDto> {
    try {
      const refreshToken = req.cookies['refresh_token'];
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
      const access_token = generateAccessToken(payload, this.configService);

      return {
        ok: true,
        access_token,
      };
    } catch (e) {
      this.logger.error(`Error in silentRefresh: ${e.message}`, e.stack);
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
      this.logger.error(`Error in logout for user [${user}]: ${e.message}`, e.stack);
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

    const access_token = generateAccessToken(payload, this.configService);
    const refresh_token = generateRefreshToken(findUser.id, this.configService);

    findUser.refresh_token = refresh_token;
    await this.userQueryRepository.save(findUser);

    setRefreshCookie(res, refresh_token, this.configService);

    return { access_token };
  }
}
