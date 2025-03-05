import { TestBed } from '@automock/jest';
import { NotFoundException } from '@nestjs/common';
import { ERROR } from 'src/commons/constants/error';
import * as tokenHelper from 'src/commons/helpers/token.helper';
import { UserEntity } from 'src/entities/user.entity';
import { ApiUserPutUpdateRequestBodyDto } from 'src/user/dto/api-user-put-update-request-body.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;
  let userQueryRepository: jest.Mocked<UserQueryRepository>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(UserService).compile();
    userService = unit;
    userQueryRepository = unitRef.get(UserQueryRepository);
    jest.clearAllMocks();
  });

  describe('getAccessToken', () => {
    it('should return access token when user exists', async () => {
      // Given
      const uuid = 'test-uuid';
      const dummyUser = { id: 1, uuid, name: 'TestUser', profile_image: 'test.png' } as UserEntity;
      jest.spyOn(userQueryRepository, 'findOne').mockResolvedValue(dummyUser);
      jest.spyOn(tokenHelper, 'generateAccessToken').mockReturnValue('dummy_token');

      // When
      const result = await userService.getAccessToken(uuid);

      // Then
      expect(userQueryRepository.findOne).toHaveBeenCalledWith(uuid);
      expect(result).toEqual(
        expect.objectContaining({
          id: dummyUser.id,
          uuid: dummyUser.uuid,
          nickname: dummyUser.name,
          profile_image: dummyUser.profile_image,
          access_token: 'dummy_token',
        }),
      );
    });
  });

  describe('profileUpdate', () => {
    it('should update profile when update fields provided', async () => {
      // Given
      const dto: ApiUserPutUpdateRequestBodyDto = { name: 'NewName', profile_image: 'new.png' };
      const user: UserDto = { uuid: 'user-uuid' } as UserDto;
      jest.spyOn(userQueryRepository, 'profileUpdate').mockResolvedValue(undefined);

      // When
      const result = await userService.profileUpdate(dto, user);

      // Then
      expect(userQueryRepository.profileUpdate).toHaveBeenCalledWith(dto, user);
      expect(result).toEqual({ uuid: user.uuid });
    });

    it('should not update profile when no update fields provided', async () => {
      // Given
      const dto: ApiUserPutUpdateRequestBodyDto = {};
      const user: UserDto = { uuid: 'user-uuid' } as UserDto;
      const updateSpy = jest.spyOn(userQueryRepository, 'profileUpdate');

      // When
      const result = await userService.profileUpdate(dto, user);

      // Then
      expect(updateSpy).not.toHaveBeenCalled();
      expect(result).toEqual({ uuid: user.uuid });
    });
  });

  describe('getProfile', () => {
    it('should return profile when user exists', async () => {
      // Given
      const user: UserDto = { uuid: 'user-uuid' } as UserDto;
      const dummyProfile = {
        id: 1,
        uuid: 'user-uuid',
        name: 'TestUser',
        profile_image: 'test.png',
      } as UserEntity;
      jest.spyOn(userQueryRepository, 'findOne').mockResolvedValue(dummyProfile);

      // When
      const result = await userService.getProfile(user);

      // Then
      expect(userQueryRepository.findOne).toHaveBeenCalledWith(user.uuid);
      expect(result).toEqual(
        expect.objectContaining({
          id: dummyProfile.id,
          uuid: dummyProfile.uuid,
          name: dummyProfile.name,
          profile_image: dummyProfile.profile_image,
        }),
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Given
      const user: UserDto = { uuid: 'user-uuid' } as UserDto;
      jest.spyOn(userQueryRepository, 'findOne').mockResolvedValue(null);

      // When & Then
      await expect(userService.getProfile(user)).rejects.toThrow(NotFoundException);
      await expect(userService.getProfile(user)).rejects.toThrow(ERROR.NOT_EXIST_DATA);
    });
  });
});
