import { TestBed } from '@automock/jest';
import { NotFoundException } from '@nestjs/common';
import { ERROR } from 'src/commons/constants/error';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { ApiUserGetProfileResponseDto } from 'src/user/dto/api-user-get-profile-response.dto';
import { ApiUserGetTokenResponseDto } from 'src/user/dto/api-user-get-token-response.dto';
import { ApiUserPutUpdateRequestBodyDto } from 'src/user/dto/api-user-put-update-request-body.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { UserController } from './user.controller';

describe('UserController', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(UserController).compile();
    userController = unit;
    userService = unitRef.get(UserService);
    jest.clearAllMocks();
  });

  describe('profileUpdate', () => {
    it('should update profile when update fields provided', async () => {
      // Given
      const dto: ApiUserPutUpdateRequestBodyDto = { name: 'NewName', profile_image: 'new.png' };
      const user: UserDto = { uuid: 'user-uuid' } as UserDto;
      const expectedResponse: UuidResponseDto = { uuid: user.uuid };
      jest.spyOn(userService, 'profileUpdate').mockResolvedValue(expectedResponse);

      // When
      const result = await userController.profileUpdate(dto, user);

      // Then
      expect(userService.profileUpdate).toHaveBeenCalledWith(dto, user);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getAccessToken', () => {
    it('should return access token for provided uuid', async () => {
      // Given
      const uuid = 'test-uuid';
      const expectedResponse: ApiUserGetTokenResponseDto = {
        id: 1,
        uuid,
        nickname: 'TestUser',
        profile_image: 'test.png',
        access_token: 'dummy_token',
      };
      jest.spyOn(userService, 'getAccessToken').mockResolvedValue(expectedResponse);

      // When
      const result = await userController.getAccessToken(uuid);

      // Then
      expect(userService.getAccessToken).toHaveBeenCalledWith(uuid);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getProfile', () => {
    it('should return profile when user exists', async () => {
      // Given
      const user: UserDto = { uuid: 'user-uuid' } as UserDto;
      const expectedResponse: ApiUserGetProfileResponseDto = {
        id: 1,
        uuid: 'user-uuid',
        name: 'TestUser',
        profile_image: 'test.png',
      } as ApiUserGetProfileResponseDto;
      jest.spyOn(userService, 'getProfile').mockResolvedValue(expectedResponse);

      // When
      const result = await userController.getProfile(user);

      // Then
      expect(userService.getProfile).toHaveBeenCalledWith(user);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Given
      const user: UserDto = { uuid: 'user-uuid' } as UserDto;
      jest
        .spyOn(userService, 'getProfile')
        .mockRejectedValue(new NotFoundException(ERROR.NOT_EXIST_DATA));

      // When & Then
      await expect(userController.getProfile(user)).rejects.toThrow(NotFoundException);
      await expect(userController.getProfile(user)).rejects.toThrow(ERROR.NOT_EXIST_DATA);
    });
  });
});
