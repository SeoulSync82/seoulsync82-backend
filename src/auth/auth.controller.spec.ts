import { TestBed } from '@automock/jest';
import { UnauthorizedException } from '@nestjs/common';
import { blancLogger } from 'blanc-logger';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { ApiAuthPostUserLogoutResponseDto } from 'src/auth/dto/api-auth-post-user-logout-response.dto';
import { ApiAuthPostUserRefreshResponseDto } from 'src/auth/dto/api-auth-post-user-refresh-response.dto';
import { GoogleRequest, KakaoRequest, NaverRequest } from 'src/auth/interfaces/auth.interface';
import * as frontendHelper from 'src/commons/helpers/frontend-redirect.helper';
import { ConfigService } from 'src/config/config.service';
import { UserDto } from 'src/user/dto/user.dto';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    jest.spyOn(blancLogger, 'error').mockImplementation(() => {});
    jest.spyOn(blancLogger, 'log').mockImplementation(() => {});

    // DI를 통한 의존성 주입: TestBed.create(AuthController)로 자동 목 처리된 의존성 사용
    const { unit, unitRef } = TestBed.create(AuthController).compile();
    authController = unit;
    authService = unitRef.get(AuthService);
    configService = unitRef.get(ConfigService);
    jest.clearAllMocks();
  });

  describe('googleCallback', () => {
    it('should handle google callback and redirect to frontend with token', async () => {
      // Given
      const dummyToken = 'dummy_token';
      const req = {
        headers: { referer: 'http://backend.com' },
        user: { dummy: 'user' },
      } as unknown as GoogleRequest;
      const res = { redirect: jest.fn() } as unknown as Response;
      jest.spyOn(authService, 'handleSocialLogin').mockResolvedValue({ access_token: dummyToken });
      jest.spyOn(frontendHelper, 'getFrontendUrl').mockReturnValue('http://frontend.com');

      // When
      await authController.googleCallback(req, res);

      // Then
      expect(authService.handleSocialLogin).toHaveBeenCalledWith(req, res, 'google');
      expect(frontendHelper.getFrontendUrl).toHaveBeenCalledWith(
        'http://backend.com',
        configService,
      );
      expect(res.redirect).toHaveBeenCalledWith('http://frontend.com/?token=dummy_token');
    });

    it('should handle google callback with missing referer and redirect accordingly', async () => {
      // Given: referer가 없는 경우
      const dummyToken = 'dummy_token';
      const req = {
        headers: {},
        user: { dummy: 'user' },
      } as unknown as GoogleRequest;
      const res = { redirect: jest.fn() } as unknown as Response;
      // getFrontendUrl가 ''로 반환하도록 설정
      jest.spyOn(authService, 'handleSocialLogin').mockResolvedValue({ access_token: dummyToken });
      jest.spyOn(frontendHelper, 'getFrontendUrl').mockReturnValue('http://frontend.com');

      // When
      await authController.googleCallback(req, res);

      // Then: req.headers.referer || ''가 ''로 처리됨
      expect(frontendHelper.getFrontendUrl).toHaveBeenCalledWith('', configService);
      expect(res.redirect).toHaveBeenCalledWith('http://frontend.com/?token=dummy_token');
    });

    it('should throw UnauthorizedException on error in google callback', async () => {
      // Given
      const req = {
        headers: { referer: 'http://backend.com' },
        user: { dummy: 'user' },
      } as unknown as GoogleRequest;
      const res = { redirect: jest.fn() } as unknown as Response;
      jest.spyOn(authService, 'handleSocialLogin').mockRejectedValue(new Error('Test error'));

      // When & Then
      await expect(authController.googleCallback(req, res)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('kakaoCallback', () => {
    it('should handle kakao callback and redirect to frontend with token', async () => {
      // Given
      const dummyToken = 'dummy_token_kakao';
      const req = {
        headers: { referer: 'http://backend.com' },
        user: { dummy: 'user' },
      } as unknown as KakaoRequest;
      const res = { redirect: jest.fn() } as unknown as Response;
      jest.spyOn(authService, 'handleSocialLogin').mockResolvedValue({ access_token: dummyToken });
      jest.spyOn(frontendHelper, 'getFrontendUrl').mockReturnValue('http://frontend.com');

      // When
      await authController.kakaoCallback(req, res);

      // Then
      expect(authService.handleSocialLogin).toHaveBeenCalledWith(req, res, 'kakao');
      expect(frontendHelper.getFrontendUrl).toHaveBeenCalledWith(
        'http://backend.com',
        configService,
      );
      expect(res.redirect).toHaveBeenCalledWith('http://frontend.com/?token=dummy_token_kakao');
    });

    it('should throw UnauthorizedException on error in kakao callback', async () => {
      // Given
      const req = {
        headers: { referer: 'http://backend.com' },
        user: { dummy: 'user' },
      } as unknown as KakaoRequest;
      const res = { redirect: jest.fn() } as unknown as Response;
      jest.spyOn(authService, 'handleSocialLogin').mockRejectedValue(new Error('Test error'));

      // When & Then
      await expect(authController.kakaoCallback(req, res)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('naverCallback', () => {
    it('should handle naver callback and redirect to frontend with token', async () => {
      // Given
      const dummyToken = 'dummy_token_naver';
      const req = {
        headers: { referer: 'http://backend.com' },
        user: { dummy: 'user' },
      } as unknown as NaverRequest;
      const res = { redirect: jest.fn() } as unknown as Response;
      jest.spyOn(authService, 'handleSocialLogin').mockResolvedValue({ access_token: dummyToken });
      jest.spyOn(frontendHelper, 'getFrontendUrl').mockReturnValue('http://frontend.com');

      // When
      await authController.naverCallback(req, res);

      // Then
      expect(authService.handleSocialLogin).toHaveBeenCalledWith(req, res, 'naver');
      expect(frontendHelper.getFrontendUrl).toHaveBeenCalledWith(
        'http://backend.com',
        configService,
      );
      expect(res.redirect).toHaveBeenCalledWith('http://frontend.com/?token=dummy_token_naver');
    });

    it('should throw UnauthorizedException on error in naver callback', async () => {
      // Given
      const req = {
        headers: { referer: 'http://backend.com' },
        user: { dummy: 'user' },
      } as unknown as NaverRequest;
      const res = { redirect: jest.fn() } as unknown as Response;
      jest.spyOn(authService, 'handleSocialLogin').mockRejectedValue(new Error('Test error'));

      // When & Then
      await expect(authController.naverCallback(req, res)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('silentRefresh', () => {
    it('should return refresh response from authService', async () => {
      // Given
      const req = {} as any;
      const res = {} as Response;
      const dummyResponse: ApiAuthPostUserRefreshResponseDto = {
        ok: true,
        access_token: 'refreshed_token',
      };
      jest.spyOn(authService, 'silentRefresh').mockResolvedValue(dummyResponse);

      // When
      const result = await authController.silentRefresh(req, res);

      // Then
      expect(authService.silentRefresh).toHaveBeenCalledWith(req, res);
      expect(result).toEqual(dummyResponse);
    });
  });

  describe('logout', () => {
    it('should return logout response from authService', async () => {
      // Given
      const res = { clearCookie: jest.fn() } as unknown as Response;
      const dummyUser: UserDto = { uuid: 'user-uuid' } as UserDto;
      const dummyResponse: ApiAuthPostUserLogoutResponseDto = { ok: true };
      jest.spyOn(authService, 'logout').mockResolvedValue(dummyResponse);

      // When
      const result = await authController.logout(res, dummyUser);

      // Then
      expect(authService.logout).toHaveBeenCalledWith(dummyUser, res);
      expect(result).toEqual(dummyResponse);
    });
  });

  describe('social login entry points', () => {
    it('googleAuth should be defined and return undefined', async () => {
      // Given
      const req = {} as Request;
      // When
      const result = await authController.googleAuth(req);
      // Then: 해당 엔드포인트는 아무것도 반환하지 않음
      expect(result).toBeUndefined();
    });

    it('kakaoAuth should be defined and return undefined', async () => {
      // Given
      const req = {} as Request;
      // When
      const result = await authController.kakaoAuth(req);
      // Then
      expect(result).toBeUndefined();
    });

    it('naverAuth should be defined and return undefined', async () => {
      // Given
      const req = {} as Request;
      // When
      const result = await authController.naverAuth(req);
      // Then
      expect(result).toBeUndefined();
    });
  });
});
