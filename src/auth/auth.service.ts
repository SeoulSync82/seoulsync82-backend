import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from 'src/config/config.service';
import { UserService } from 'src/user/user.service';
import { GoogleLoginAuthOutputDto } from './dto/google-login-auth.dto';
import { ValidateAuthInputDto, ValidateAuthOutputDto } from './dto/validate-auth.dto';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
// import { Provider } from 'src/entites/user.entity';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { GoogleRequest } from './interfaces/auth.interface';
import { generateUUID } from 'src/commons/util/uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}
  async validateUser(validateAuthInputDto: ValidateAuthInputDto) {
    try {
      const { email } = validateAuthInputDto;
      const user = await this.userService.getUser({ email });
      if (!user) return { ok: false, error: '존재하지 않는 이메일 계정입니다.' };
      return { ok: true, data: user };
    } catch (error) {
      return { ok: false, error: '로그인 인증에 실패하였습니다.' };
    }
  }

  async googleLogin(
    req: GoogleRequest,
    res: Response,
    // googleLoginAuthInputDto, // : Promise<GoogleLoginAuthOutputDto>
  ) {
    try {
      req.user.nickname = req.user.firstName + req.user.lastName;
      const { user } = req;
      delete user.lastName;
      delete user.firstName;
      user.type = 'google';

      // 유저 중복 검사
      let findUser = await this.userQueryRepository.findUser(user);

      // 없는 유저면 DB에 유저정보 저장
      if (!findUser) {
        const uuid = generateUUID();
        findUser = await this.userQueryRepository.createUser(user, uuid);
      }
      console.log(findUser);
      // if (findUser && findUser.provider !== Provider.Google) {
      //   return { ok: false, error: '현재 계정으로 가입한 이메일이 존재합니다.' };
      // }

      // 구글 가입이 되어 있는 경우 accessToken 및 refreshToken 발급
      const findUserPayload = { id: findUser.id };
      const eid_access_token = jwt.sign(findUserPayload, this.configService.get('JWT_SECRET'), {
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      });
      const eid_refresh_token = jwt.sign({}, this.configService.get('JWT_REFRESH_KEY'), {
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
        audience: String(findUser.id),
      });
      console.log('eid_access_token', eid_access_token);
      console.log('eid_refresh_token', eid_refresh_token);

      /* refreshToken 필드 업데이트 */
      findUser.eid_refresh_token = eid_refresh_token;
      await this.userQueryRepository.save(findUser);

      // 쿠키 설정
      const now = new Date();
      now.setDate(now.getDate() + +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_DATE'));
      console.log(this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_DATE'));
      res.cookie('eid_refresh_token', eid_refresh_token, {
        expires: now,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });
      return {
        ok: true,
        eid_access_token,
      };
    } catch (error) {
      return { ok: false, error: '구글 로그인 인증을 실패 하였습니다.' };
    }
  }
}
