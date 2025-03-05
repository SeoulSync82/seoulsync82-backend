import { TestBed } from '@automock/jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SocialUser } from 'src/auth/interfaces/auth.interface';
import { UserEntity } from 'src/entities/user.entity';
import { ApiUserPutUpdateRequestBodyDto } from 'src/user/dto/api-user-put-update-request-body.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { In, Repository, UpdateResult } from 'typeorm';
import { UserQueryRepository } from './user.query.repository';

describe('UserQueryRepository', () => {
  let userQueryRepository: UserQueryRepository;
  let repository: jest.Mocked<Repository<UserEntity>>;

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
        nickname: '테스터',
        photo: 'photo.png',
        type: 'kakao',
      };
      const expectedUser: UserEntity = {
        id: 1,
        email: socialUser.email,
        type: socialUser.type,
      } as UserEntity;
      jest.spyOn(repository, 'findOne').mockResolvedValue(expectedUser);

      // When
      const result = await userQueryRepository.findUser(socialUser);

      // Then
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: socialUser.email, type: socialUser.type },
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('createUser', () => {
    it('should save user with proper fields when type is kakao', async () => {
      // Given
      const socialUser: SocialUser = {
        email: 'kakao@example.com',
        nickname: '카카오유저',
        photo: 'kakao.png',
        type: 'kakao',
      };
      const uuid = 'uuid-kakao';
      const expectedPayload = {
        uuid,
        email: socialUser.email,
        name: socialUser.nickname,
        profile_image: socialUser.photo,
        type: socialUser.type,
      };
      jest.spyOn(repository, 'save').mockResolvedValue(expectedPayload as UserEntity);

      // When
      const result = await userQueryRepository.createUser(socialUser, uuid);

      // Then
      expect(repository.save).toHaveBeenCalledWith(expectedPayload);
      expect(result).toEqual(expectedPayload);
    });

    it('should save user with photo set to null when type is not kakao', async () => {
      // Given
      const socialUser: SocialUser = {
        email: 'google@example.com',
        nickname: '구글유저',
        photo: 'google.png',
        type: 'google',
      };
      const uuid = 'uuid-google';
      const expectedPayload = {
        uuid,
        email: socialUser.email,
        name: socialUser.nickname,
        profile_image: null,
        type: socialUser.type,
      };
      jest.spyOn(repository, 'save').mockResolvedValue(expectedPayload as UserEntity);

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
      const userEntity: UserEntity = {
        id: 1,
        uuid: 'uuid-1',
        email: 'test@a.com',
        name: 'Test',
        profile_image: 'img.png',
        type: 'kakao',
      } as UserEntity;
      jest.spyOn(repository, 'save').mockResolvedValue(userEntity);

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
      const expectedUser: UserEntity = { id: 1, uuid: 'uuid-1', email: 'a@b.com' } as UserEntity;
      jest.spyOn(repository, 'findOne').mockResolvedValue(expectedUser);

      // When
      const result = await userQueryRepository.findId(1);

      // Then
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findOne', () => {
    it('should return user entity when uuid exists', async () => {
      // Given
      const expectedUser: UserEntity = { id: 1, uuid: 'uuid-1', email: 'a@b.com' } as UserEntity;
      jest.spyOn(repository, 'findOne').mockResolvedValue(expectedUser);

      // When
      const result = await userQueryRepository.findOne('uuid-1');

      // Then
      expect(repository.findOne).toHaveBeenCalledWith({ where: { uuid: 'uuid-1' } });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('profileUpdate', () => {
    it('should update user profile with provided fields', async () => {
      // Given
      const dto: ApiUserPutUpdateRequestBodyDto = { name: 'NewName', profile_image: 'new.png' };
      const user: UserDto = { id: 1, uuid: 'uuid-1' } as UserDto;
      const updateResult: UpdateResult = { affected: 1, raw: [] } as UpdateResult;
      jest.spyOn(repository, 'update').mockResolvedValue(updateResult);

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
      jest.spyOn(repository, 'update').mockResolvedValue(updateResult);

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
      const expectedUsers: UserEntity[] = [
        { id: 1, uuid: 'uuid-1', email: 'a@b.com' } as UserEntity,
        { id: 2, uuid: 'uuid-2', email: 'b@c.com' } as UserEntity,
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(expectedUsers);

      // When
      const result = await userQueryRepository.findUserList(uuids);

      // Then
      expect(repository.find).toHaveBeenCalledWith({ where: { uuid: In(uuids) } });
      expect(result).toEqual(expectedUsers);
    });
  });
});
