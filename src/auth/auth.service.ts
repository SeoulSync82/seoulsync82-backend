import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from 'src/config/config.service';
import { UserService } from 'src/user/user.service';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { GoogleRequest, KakaoRequest, NaverRequest } from './interfaces/auth.interface';
import { generateUUID } from 'src/commons/util/uuid';
import { ApiAuthPostUserRefreshResponseDto } from './dto/api-auth-post-user-refresh-response.dto';
import { isEmpty } from 'class-validator';
import { ApiAuthPostUserLogoutResponseDto } from './dto/api-auth-post-user-logout-response.dto';
import { UserDto } from 'src/user/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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
        now.getDate() +
          parseInt(this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_DATE')) / 1000,
      );

      res.cookie('refresh_token', refresh_token, {
        expires: now,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });

      return {
        ok: true,
        access_token,
      };
    } catch (error) {
      return { ok: false, error: '구글 로그인 인증을 실패 하였습니다.' };
    }
  }

  async kakaoLogin(req: KakaoRequest, res: Response) {
    try {
      req.user.nickname = req.user.nickname;
      const { user } = req;
      user.type = 'kakao';

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
        now.getDate() +
          parseInt(this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_DATE')) / 1000,
      );
      res.cookie('refresh_token', refresh_token, {
        expires: now,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });

      return {
        ok: true,
        access_token,
      };
    } catch (error) {
      return { ok: false, error: '카카오 로그인 인증을 실패 하였습니다.' };
    }
  }

  async naverLogin(req: NaverRequest, res: Response) {
    try {
      req.user.nickname = req.user.nickname;
      const { user } = req;
      user.type = 'naver';

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
        now.getDate() +
          parseInt(this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_DATE')) / 1000,
      );

      res.cookie('refresh_token', refresh_token, {
        expires: now,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
      return {
        ok: true,
        access_token,
      };
    } catch (error) {
      return { ok: false, error: '네이버 로그인 인증을 실패 하였습니다.' };
    }
  }

  async silentRefresh(req: Request, res: Response): Promise<ApiAuthPostUserRefreshResponseDto> {
    try {
      const getRefreshToken = req.cookies['refresh_token'];
      if (isEmpty(getRefreshToken)) {
        return { ok: false };
      }
      let userId: string | string[] | null;
      jwt.verify(
        getRefreshToken,
        this.configService.get('JWT_REFRESH_KEY'),
        (err: jwt.VerifyErrors | null, decoded: jwt.JwtPayload | undefined) => {
          if (err) {
            res.clearCookie('refresh_token');
            return { ok: false, error: '토큰이 유효하지 않습니다. 로그인이 필요합니다' };
          }
          userId = decoded.aud;
        },
      );

      // 로그아웃 후에는 Silent Refresh를 무시
      const loginUser = await this.userQueryRepository.findId(+userId);
      if (loginUser.refresh_token !== getRefreshToken) {
        return { ok: false, error: '토큰이 유효하지 않습니다. 로그인이 필요합니다' };
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
      return { ok: false, error: '로그인 연장에 실패하였습니다.' };
    }
  }

  async logout(user: UserDto, res): Promise<ApiAuthPostUserLogoutResponseDto> {
    try {
      if (isEmpty(user.id)) return { ok: false, error: '접근 권한을 가지고 있지 않습니다' };

      const loginUser = await this.userQueryRepository.findId(user.id);
      loginUser.refresh_token = null;
      await this.userQueryRepository.save(loginUser);
      res.clearCookie('refreshToken');
      return { ok: true };
    } catch (error) {
      return { ok: false, error: '로그아웃을 실패하였습니다' };
    }
  }
}
