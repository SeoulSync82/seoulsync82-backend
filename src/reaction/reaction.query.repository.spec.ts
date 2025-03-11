import { TestBed } from '@automock/jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReactionEntity } from 'src/entities/reaction.entity';
import { UserDto } from 'src/user/dto/user.dto';
import { In, Repository } from 'typeorm';
import { ReactionQueryRepository } from './reaction.query.repository';

describe('ReactionQueryRepository', () => {
  let reactionQueryRepository: ReactionQueryRepository;
  let repository: jest.Mocked<Repository<ReactionEntity>>;

  beforeEach(async () => {
    // Given
    const { unit, unitRef } = TestBed.create(ReactionQueryRepository).compile();
    reactionQueryRepository = unit;
    repository = unitRef.get(getRepositoryToken(ReactionEntity) as string);
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return reaction when found by uuid and user', async () => {
      // Given
      const user = { uuid: 'user-1' } as UserDto;
      const uuid = 'target-uuid';
      const fakeReaction: ReactionEntity = {
        id: 1,
        target_uuid: uuid,
        user_uuid: user.uuid,
        like: 1,
      } as ReactionEntity;
      jest.spyOn(repository, 'findOne').mockResolvedValue(fakeReaction);
      // When
      const result = await reactionQueryRepository.findOne(uuid, user);
      // Then
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { target_uuid: uuid, user_uuid: user.uuid },
      });
      expect(result).toEqual(fakeReaction);
    });
  });

  describe('courseLike', () => {
    it('should save and return the reaction', async () => {
      // Given
      const reaction: ReactionEntity = {
        id: 1,
        target_uuid: 'target-uuid',
        user_uuid: 'user-1',
        like: 1,
      } as ReactionEntity;
      jest.spyOn(repository, 'save').mockResolvedValue(reaction);
      // When
      const result = await reactionQueryRepository.courseLike(reaction);
      // Then
      expect(repository.save).toHaveBeenCalledWith(reaction);
      expect(result).toEqual(reaction);
    });
  });

  describe('updateCourseLike', () => {
    it('should update reaction like to 1', async () => {
      // Given
      const reaction: ReactionEntity = { id: 1, like: 0 } as ReactionEntity;
      const updateResult = { affected: 1 };
      jest.spyOn(repository, 'update').mockResolvedValue(updateResult as any);
      // When
      const result = await reactionQueryRepository.updateCourseLike(reaction);
      // Then
      expect(repository.update).toHaveBeenCalledWith({ id: reaction.id }, { like: 1 });
      expect(result).toEqual(updateResult);
    });
  });

  describe('updateCourseLikeDelete', () => {
    it('should update reaction like to 0', async () => {
      // Given
      const reaction: ReactionEntity = { id: 1, like: 1 } as ReactionEntity;
      const updateResult = { affected: 1 };
      jest.spyOn(repository, 'update').mockResolvedValue(updateResult as any);
      // When
      const result = await reactionQueryRepository.updateCourseLikeDelete(reaction);
      // Then
      expect(repository.update).toHaveBeenCalledWith({ id: reaction.id }, { like: 0 });
      expect(result).toEqual(updateResult);
    });
  });

  describe('findCommunityReaction', () => {
    it('should return reactions for given target uuids with like equal to 1', async () => {
      // Given
      const uuids = ['t1', 't2'];
      const fakeReactions: ReactionEntity[] = [
        { id: 1, target_uuid: 't1', like: 1 } as ReactionEntity,
        { id: 2, target_uuid: 't2', like: 1 } as ReactionEntity,
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(fakeReactions);
      // When
      const result = await reactionQueryRepository.findCommunityReaction(uuids);
      // Then
      expect(repository.find).toHaveBeenCalledWith({ where: { target_uuid: In(uuids), like: 1 } });
      expect(result).toEqual(fakeReactions);
    });
  });

  describe('findCommunityDetailReaction', () => {
    it('should return reactions for given community target uuid with like equal to 1', async () => {
      // Given
      const uuid = 'community-uuid';
      const fakeReactions: ReactionEntity[] = [
        { id: 1, target_uuid: uuid, like: 1 } as ReactionEntity,
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(fakeReactions);
      // When
      const result = await reactionQueryRepository.findCommunityDetailReaction(uuid);
      // Then
      expect(repository.find).toHaveBeenCalledWith({ where: { target_uuid: uuid, like: 1 } });
      expect(result).toEqual(fakeReactions);
    });
  });
});
