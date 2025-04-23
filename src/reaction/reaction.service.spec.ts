import { TestBed } from '@automock/jest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as generateUUID from 'src/commons/util/uuid';
import { CommunityQueryRepository } from 'src/community/community.query.repository';
import { CommunityEntity } from 'src/entities/community.entity';
import { ReactionEntity } from 'src/entities/reaction.entity';
import { NotificationDetailDto } from 'src/notification/dto/notification-detail.dto';
import { ReactionQueryRepository } from 'src/reaction/reaction.query.repository';
import { UserDto } from 'src/user/dto/user.dto';
import { ReactionService } from './reaction.service';

describe('ReactionService', () => {
  let reactionService: ReactionService;
  let communityQueryRepository: jest.Mocked<CommunityQueryRepository>;
  let reactionQueryRepository: jest.Mocked<ReactionQueryRepository>;

  beforeEach(async () => {
    // Given
    const { unit, unitRef } = TestBed.create(ReactionService).compile();
    reactionService = unit;
    communityQueryRepository = unitRef.get(CommunityQueryRepository);
    reactionQueryRepository = unitRef.get(ReactionQueryRepository);
    jest.clearAllMocks();
  });

  describe('reactionToCommunity', () => {
    it('should throw NotFoundException when community does not exist', async () => {
      // Given
      const user = { uuid: 'user-1', nickname: 'UserOne' } as UserDto;
      const uuid = 'community-uuid';
      communityQueryRepository.findOne.mockResolvedValue(null);
      // When & Then
      await expect(reactionService.reactionToCommunity(user, uuid)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when reaction exists and like is 1', async () => {
      // Given
      const user = { uuid: 'user-1', nickname: 'UserOne' } as UserDto;
      const uuid = 'community-uuid';
      const community: CommunityEntity = { uuid, user_uuid: 'owner-uuid' } as CommunityEntity;
      communityQueryRepository.findOne.mockResolvedValue(community);
      const existingReaction: ReactionEntity = { like: 1 } as ReactionEntity;
      reactionQueryRepository.findOne.mockResolvedValue(existingReaction);
      // When & Then
      await expect(reactionService.reactionToCommunity(user, uuid)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should update reaction when reaction exists and like is 0', async () => {
      // Given
      const user = { uuid: 'user-1', nickname: 'UserOne' } as UserDto;
      const uuid = 'community-uuid';
      const community: CommunityEntity = { uuid, user_uuid: 'owner-uuid' } as CommunityEntity;
      communityQueryRepository.findOne.mockResolvedValue(community);
      const existingReaction: ReactionEntity = { like: 0 } as ReactionEntity;
      reactionQueryRepository.findOne.mockResolvedValue(existingReaction);
      reactionQueryRepository.updateCourseLike.mockResolvedValue(undefined);
      // When
      const result = await reactionService.reactionToCommunity(user, uuid);
      // Then
      expect(reactionQueryRepository.updateCourseLike).toHaveBeenCalledWith(existingReaction);
      expect(result).toEqual({ data: { uuid }, notification: null });
    });

    it('should create new reaction and return notification when reaction does not exist', async () => {
      // Given
      const user = { uuid: 'user-1', nickname: 'UserOne' } as UserDto;
      const uuid = 'community-uuid';
      const community: CommunityEntity = { uuid, user_uuid: 'owner-uuid' } as CommunityEntity;
      communityQueryRepository.findOne.mockResolvedValue(community);
      reactionQueryRepository.findOne.mockResolvedValue(null);
      jest
        .spyOn(generateUUID, 'generateUUID')
        .mockReturnValueOnce('new-reaction-uuid')
        .mockReturnValueOnce('new-notif-uuid');
      reactionQueryRepository.courseLike.mockResolvedValue(undefined);
      // When
      const result = await reactionService.reactionToCommunity(user, uuid);
      // Then
      expect(reactionQueryRepository.courseLike).toHaveBeenCalled();
      expect(result.data).toEqual({ uuid });
      const notif: NotificationDetailDto = result.notification;
      expect(notif).toEqual({
        uuid: 'new-notif-uuid',
        user_uuid: user.uuid,
        target_uuid: community.uuid,
        target_user_uuid: community.user_uuid,
        content: `회원님의 게시물을 ${user.nickname}님이 좋아합니다.`,
      });
    });
  });

  describe('reactionDeleteToCommunity', () => {
    it('should throw NotFoundException when community or reaction does not exist', async () => {
      // Given
      const user = { uuid: 'user-1' } as UserDto;
      const uuid = 'community-uuid';
      communityQueryRepository.findOne.mockResolvedValue(null);
      reactionQueryRepository.findOne.mockResolvedValue(null);
      // When & Then
      await expect(reactionService.reactionDeleteToCommunity(user, uuid)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when reaction like is 0', async () => {
      // Given
      const user = { uuid: 'user-1' } as UserDto;
      const uuid = 'community-uuid';
      const community: CommunityEntity = { uuid, user_uuid: 'owner-uuid' } as CommunityEntity;
      communityQueryRepository.findOne.mockResolvedValue(community);
      const reaction: ReactionEntity = { like: 0 } as ReactionEntity;
      reactionQueryRepository.findOne.mockResolvedValue(reaction);
      // When & Then
      await expect(reactionService.reactionDeleteToCommunity(user, uuid)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should delete reaction and return uuid when reaction like is 1', async () => {
      // Given
      const user = { uuid: 'user-1' } as UserDto;
      const uuid = 'community-uuid';
      const community: CommunityEntity = { uuid, user_uuid: 'owner-uuid' } as CommunityEntity;
      communityQueryRepository.findOne.mockResolvedValue(community);
      const reaction: ReactionEntity = { id: 1, like: 1 } as ReactionEntity;
      reactionQueryRepository.findOne.mockResolvedValue(reaction);
      reactionQueryRepository.updateCourseLikeDelete.mockResolvedValue(undefined);
      // When
      const result = await reactionService.reactionDeleteToCommunity(user, uuid);
      // Then
      expect(reactionQueryRepository.updateCourseLikeDelete).toHaveBeenCalledWith(reaction);
      expect(result).toEqual({ uuid });
    });
  });
});
