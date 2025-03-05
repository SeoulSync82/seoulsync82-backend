import { TestBed } from '@automock/jest';
import { UnauthorizedException } from '@nestjs/common';
import { blancLogger } from 'blanc-logger';
import { Request, Response } from 'express';
import { ApiAuthPostUserLogoutResponseDto } from 'src/auth/dto/api-auth-post-user-logout-response.dto';
import { ApiAuthPostUserRefreshResponseDto } from 'src/auth/dto/api-auth-post-user-refresh-response.dto';
import { SocialUser } from 'src/auth/interfaces/auth.interface';
import * as jwtHelper from 'src/commons/helpers/jwt.helper';
import * as tokenHelper from 'src/commons/helpers/token.helper';
import * as uuidUtil from 'src/commons/util/uuid';
import { UserEntity } from 'src/entities/user.entity';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userQueryRepository: jest.Mocked<UserQueryRepository>;

  beforeEach(async () => {
    jest.spyOn(blancLogger, 'error').mockImplementation(() => {});

    const { unit, unitRef } = TestBed.create(AuthService).compile();
    authService = unit;
    userQueryRepository = unitRef.get(UserQueryRepository);
    jest.clearAllMocks();
  });

  describe('handleSocialLogin', () => {
    it('should return access token on successful social login', async () => {
      // Given
      const provider = 'kakao';
      const socialUser: SocialUser = {
        email: 'test@example.com',
        type: 'kakao',
        nickname: 'TestUser',
        photo: 'img.png',
      };
      const req = { user: socialUser } as unknown as Request;
      const res = {} as Response;
      const dummyResponse = { access_token: 'dummy_access_token' };

      jest.spyOn(authService, 'getOrCreateUserAuth').mockResolvedValue(dummyResponse);

      // When
      const result = await authService.handleSocialLogin(req, res, provider);

      // Then
      expect(authService.getOrCreateUserAuth).toHaveBeenCalledWith(
        { ...socialUser, type: provider },
        res,
      );
      expect(result).toEqual(dummyResponse);
    });

    it('should throw UnauthorizedException on error', async () => {
      // Given
      const provider = 'kakao';
      const socialUser: SocialUser = {
        email: 'fail@example.com',
        type: 'kakao',
        nickname: 'FailUser',
        photo: 'img.png',
      };
      const req = { user: socialUser } as unknown as Request;
      const res = {} as Response;
      jest.spyOn(authService, 'getOrCreateUserAuth').mockRejectedValue(new Error('Test error'));
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // When & Then
      await expect(authService.handleSocialLogin(req, res, provider)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('silentRefresh', () => {
    const refreshToken = 'dummy_refresh_token';
    const dummyUser: UserEntity = {
      id: 1,
      uuid: 'uuid-1',
      name: 'TestUser',
      profile_image: 'img.png',
      email: 'test@example.com',
      type: 'kakao',
      refresh_token: refreshToken,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should return new access token on successful silent refresh', async () => {
      // Given
      const req = { cookies: { refresh_token: refreshToken } } as unknown as Request;
      const res = { clearCookie: jest.fn() } as unknown as Response;
      const decodedPayload = { aud: `${dummyUser.id}` };

      jest.spyOn(jwtHelper, 'verifyJWT').mockResolvedValue(decodedPayload);
      jest.spyOn(userQueryRepository, 'findId').mockResolvedValue(dummyUser);
      const dummyAccessToken = 'new_dummy_access_token';
      jest.spyOn(tokenHelper, 'generateAccessToken').mockReturnValue(dummyAccessToken);

      // When
      const result: ApiAuthPostUserRefreshResponseDto = await authService.silentRefresh(req, res);

      // Then
      expect(result).toEqual({ ok: true, access_token: dummyAccessToken });
      expect(userQueryRepository.findId).toHaveBeenCalledWith(dummyUser.id);
    });

    it('should throw UnauthorizedException if refresh token is empty', async () => {
      // Given
      const req = { cookies: { refresh_token: '' } } as unknown as Request;
      const res = { clearCookie: jest.fn() } as unknown as Response;

      // When & Then
      await expect(authService.silentRefresh(req, res)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if decoded payload has no aud', async () => {
      // Given
      const req = { cookies: { refresh_token: refreshToken } } as unknown as Request;
      const res = { clearCookie: jest.fn() } as unknown as Response;
      jest.spyOn(jwtHelper, 'verifyJWT').mockResolvedValue({ aud: null });

      // When & Then
      await expect(authService.silentRefresh(req, res)).rejects.toThrow(UnauthorizedException);
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
    });

    it('should throw UnauthorizedException if stored refresh token does not match', async () => {
      // Given
      const req = { cookies: { refresh_token: refreshToken } } as unknown as Request;
      const res = { clearCookie: jest.fn() } as unknown as Response;
      const decodedPayload = { aud: `${dummyUser.id}` };
      jest.spyOn(jwtHelper, 'verifyJWT').mockResolvedValue(decodedPayload);

      const mismatchedUser = { ...dummyUser, refresh_token: 'different_token' };
      jest.spyOn(userQueryRepository, 'findId').mockResolvedValue(mismatchedUser);

      // When & Then
      await expect(authService.silentRefresh(req, res)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    const dummyUser: UserEntity = {
      id: 1,
      uuid: 'uuid-1',
      name: 'TestUser',
      profile_image: 'img.png',
      email: 'test@example.com',
      type: 'kakao',
      refresh_token: 'token',
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should logout user successfully', async () => {
      // Given
      const user = { id: dummyUser.id, uuid: dummyUser.uuid } as any;
      const res = { clearCookie: jest.fn() } as unknown as Response;
      jest.spyOn(userQueryRepository, 'findId').mockResolvedValue(dummyUser);
      const savedUser = { ...dummyUser, refresh_token: null };
      jest.spyOn(userQueryRepository, 'save').mockResolvedValue(savedUser);

      // When
      const result: ApiAuthPostUserLogoutResponseDto = await authService.logout(user, res);

      // Then
      expect(userQueryRepository.findId).toHaveBeenCalledWith(user.id);
      expect(userQueryRepository.save).toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(result).toEqual({ ok: true });
    });

    it('should throw UnauthorizedException if user id is empty', async () => {
      // Given
      const user = { id: null } as any;
      const res = { clearCookie: jest.fn() } as unknown as Response;

      // When & Then
      await expect(authService.logout(user, res)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on error during logout', async () => {
      // Given
      const user = { id: dummyUser.id, uuid: dummyUser.uuid } as any;
      const res = { clearCookie: jest.fn() } as unknown as Response;
      jest.spyOn(userQueryRepository, 'findId').mockRejectedValue(new Error('Logout error'));
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // When & Then
      await expect(authService.logout(user, res)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getOrCreateUserAuth', () => {
    const socialUser: SocialUser = {
      email: 'test@example.com',
      type: 'kakao',
      nickname: 'TestUser',
      photo: 'img.png',
    };
    const res = { clearCookie: jest.fn() } as unknown as Response;
    const dummyUser: UserEntity = {
      id: 1,
      uuid: 'uuid-1',
      name: 'TestUser',
      profile_image: 'img.png',
      email: 'test@example.com',
      type: 'kakao',
      refresh_token: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should create new user if not found and return access token', async () => {
      // Given
      jest.spyOn(userQueryRepository, 'findUser').mockResolvedValue(null);
      jest.spyOn(uuidUtil, 'generateUUID').mockReturnValue('new-uuid');
      jest
        .spyOn(userQueryRepository, 'createUser')
        .mockResolvedValue({ ...dummyUser, uuid: 'new-uuid' });
      const dummyAccessToken = 'dummy_access_token';
      const dummyRefreshToken = 'dummy_refresh_token';
      jest.spyOn(tokenHelper, 'generateAccessToken').mockReturnValue(dummyAccessToken);
      jest.spyOn(tokenHelper, 'generateRefreshToken').mockReturnValue(dummyRefreshToken);
      const savedUser = { ...dummyUser, refresh_token: dummyRefreshToken };
      jest.spyOn(userQueryRepository, 'save').mockResolvedValue(savedUser);
      jest.spyOn(tokenHelper, 'setRefreshCookie').mockImplementation(() => {});

      // When
      const result = await authService.getOrCreateUserAuth(socialUser, res);

      // Then
      expect(userQueryRepository.findUser).toHaveBeenCalledWith(socialUser);
      expect(userQueryRepository.createUser).toHaveBeenCalled();
      expect(userQueryRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ access_token: dummyAccessToken });
    });

    it('should use existing user and return access token', async () => {
      // Given
      jest.spyOn(userQueryRepository, 'findUser').mockResolvedValue(dummyUser);
      const dummyAccessToken = 'dummy_access_token_existing';
      const dummyRefreshToken = 'dummy_refresh_token_existing';
      jest.spyOn(tokenHelper, 'generateAccessToken').mockReturnValue(dummyAccessToken);
      jest.spyOn(tokenHelper, 'generateRefreshToken').mockReturnValue(dummyRefreshToken);
      const savedUser = { ...dummyUser, refresh_token: dummyRefreshToken };
      jest.spyOn(userQueryRepository, 'save').mockResolvedValue(savedUser);
      jest.spyOn(tokenHelper, 'setRefreshCookie').mockImplementation(() => {});

      // When
      const result = await authService.getOrCreateUserAuth(socialUser, res);

      // Then
      expect(userQueryRepository.findUser).toHaveBeenCalledWith(socialUser);
      expect(userQueryRepository.createUser).not.toHaveBeenCalled();
      expect(userQueryRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ access_token: dummyAccessToken });
    });
  });
});
