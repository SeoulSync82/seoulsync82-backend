import { TestBed } from '@automock/jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SocialUser } from 'src/auth/interfaces/auth.interface';
import { UserEntity } from 'src/entities/user.entity';
import { ApiUserPutUpdateRequestBodyDto } from 'src/user/dto/api-user-put-update-request-body.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { In, UpdateResult } from 'typeorm';
import { UserQueryRepository } from './user.query.repository';

describe('UserQueryRepository', () => {
  let userQueryRepository: UserQueryRepository;
  let repository: jest.Mocked<{
    findOne: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    find: jest.Mock;
  }>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(UserQueryRepository).compile();
    userQueryRepository = unit;
    repository = unitRef.get(getRepositoryToken(UserEntity) as string);
    jest.clearAllMocks();
  });

  describe('findUser', () => {
    it('should return user entity when found', async () => {
      // Given
      const socialUser: SocialUser = {
        email: 'test@example.com',
        nickname: 'blanc',
        photo: 'image.png',
        type: 'kakao',
      };
      const dummyUser = { id: 1, email: 'test@example.com', type: 'kakao' };
      repository.findOne.mockResolvedValue(dummyUser);

      // When
      const result = await userQueryRepository.findUser(socialUser);

      // Then
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: socialUser.email, type: socialUser.type },
      });
      expect(result).toEqual(dummyUser);
    });
  });

  describe('createUser', () => {
    it('should save user entity with proper fields', async () => {
      // Given
      const socialUser: SocialUser = {
        email: 'test@example.com',
        type: 'kakao',
        nickname: 'Tester',
        photo: 'photo.png',
      };
      const uuid = 'test-uuid';
      const expectedPayload = {
        uuid,
        email: socialUser.email,
        name: socialUser.nickname,
        profile_image: socialUser.photo,
        type: socialUser.type,
      };
      repository.save.mockResolvedValue(expectedPayload);

      // When
      const result = await userQueryRepository.createUser(socialUser, uuid);

      // Then
      expect(repository.save).toHaveBeenCalledWith(expectedPayload);
      expect(result).toEqual(expectedPayload);
    });

    it('should set photo to null when type is not kakao', async () => {
      // Given
      const socialUser: SocialUser = {
        email: 'test2@example.com',
        type: 'google',
        nickname: 'Tester2',
        photo: 'photo.png',
      };
      const uuid = 'test-uuid-2';
      const expectedPayload = {
        uuid,
        email: socialUser.email,
        name: socialUser.nickname,
        profile_image: null,
        type: socialUser.type,
      };
      repository.save.mockResolvedValue(expectedPayload);

      // When
      const result = await userQueryRepository.createUser(socialUser, uuid);

      // Then
      expect(repository.save).toHaveBeenCalledWith(expectedPayload);
      expect(result).toEqual(expectedPayload);
    });
  });

  describe('save', () => {
    it('should save and return the user entity', async () => {
      // Given
      const userEntity = {
        id: 1,
        uuid: 'uuid-1',
        email: 'a@b.com',
        name: 'Test User',
        profile_image: 'img.png',
        type: 'kakao',
        refresh_token: 'some_token',
      } as UserEntity;
      repository.save.mockResolvedValue(userEntity);

      // When
      const result = await userQueryRepository.save(userEntity);

      // Then
      expect(repository.save).toHaveBeenCalledWith(userEntity);
      expect(result).toEqual(userEntity);
    });
  });

  describe('findId', () => {
    it('should return user entity when id exists', async () => {
      // Given
      const dummyUser = { id: 1, uuid: 'uuid-1', email: 'a@b.com' };
      repository.findOne.mockResolvedValue(dummyUser);

      // When
      const result = await userQueryRepository.findId(1);

      // Then
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(dummyUser);
    });
  });

  describe('findOne', () => {
    it('should return user entity when uuid exists', async () => {
      // Given
      const dummyUser = { id: 1, uuid: 'uuid-1', email: 'a@b.com' };
      repository.findOne.mockResolvedValue(dummyUser);

      // When
      const result = await userQueryRepository.findOne('uuid-1');

      // Then
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { uuid: 'uuid-1' },
      });
      expect(result).toEqual(dummyUser);
    });
  });

  describe('profileUpdate', () => {
    it('should update user profile with provided fields', async () => {
      // Given
      const dto: ApiUserPutUpdateRequestBodyDto = { name: 'NewName', profile_image: 'new.png' };
      const user: UserDto = { id: 1, uuid: 'uuid-1' } as UserDto;
      const updateResult: UpdateResult = { affected: 1, raw: [] } as UpdateResult;
      repository.update.mockResolvedValue(updateResult);

      // When
      const result = await userQueryRepository.profileUpdate(dto, user);

      // Then
      expect(repository.update).toHaveBeenCalledWith(
        { id: user.id },
        { name: dto.name, profile_image: dto.profile_image },
      );
      expect(result).toEqual(updateResult);
    });

    it('should update user profile with only name if profile_image is missing', async () => {
      // Given
      const dto: ApiUserPutUpdateRequestBodyDto = { name: 'OnlyName' };
      const user: UserDto = { id: 2, uuid: 'uuid-2' } as UserDto;
      const updateResult: UpdateResult = { affected: 1, raw: [] } as UpdateResult;
      repository.update.mockResolvedValue(updateResult);

      // When
      const result = await userQueryRepository.profileUpdate(dto, user);

      // Then
      expect(repository.update).toHaveBeenCalledWith({ id: user.id }, { name: dto.name });
      expect(result).toEqual(updateResult);
    });
  });

  describe('findUserList', () => {
    it('should return a list of user entities matching provided uuids', async () => {
      // Given
      const uuids = ['uuid-1', 'uuid-2'];
      const dummyUsers = [
        { id: 1, uuid: 'uuid-1', email: 'a@b.com' },
        { id: 2, uuid: 'uuid-2', email: 'b@c.com' },
      ];
      repository.find.mockResolvedValue(dummyUsers);

      // When
      const result = await userQueryRepository.findUserList(uuids);

      // Then
      expect(repository.find).toHaveBeenCalledWith({
        where: { uuid: In(uuids) },
      });
      expect(result).toEqual(dummyUsers);
    });
  });
});
