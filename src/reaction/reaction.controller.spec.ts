import { TestBed } from '@automock/jest';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { NotificationDetailDto } from 'src/notification/dto/notification-detail.dto';
import { ReactionService } from 'src/reaction/reaction.service';
import { UserDto } from 'src/user/dto/user.dto';
import { ReactionController } from './reaction.controller';

describe('ReactionController', () => {
  let reactionController: ReactionController;
  let reactionService: jest.Mocked<ReactionService>;

  beforeEach(async () => {
    // Given
    const { unit, unitRef } = TestBed.create(ReactionController).compile();
    reactionController = unit;
    reactionService = unitRef.get(ReactionService);
    jest.clearAllMocks();
  });

  describe('communityReaction', () => {
    it('should return data and set req.notification when reaction is successful', async () => {
      // Given
      const user: UserDto = { uuid: 'user-1', nickname: 'UserOne' } as UserDto;
      const uuid = 'community-uuid';
      const fakeNotification = { uuid: 'notification' } as NotificationDetailDto;
      const fakeResponse = { data: { uuid }, notification: fakeNotification };
      jest.spyOn(reactionService, 'reactionToCommunity').mockResolvedValue(fakeResponse);
      const req = {} as any;
      // When
      const result = await reactionController.communityReaction(user, uuid, req);
      // Then
      expect(reactionService.reactionToCommunity).toHaveBeenCalledWith(user, uuid);
      expect(req.notification).toEqual(fakeNotification);
      expect(result).toEqual({ uuid });
    });
  });

  describe('communityReactionDelete', () => {
    it('should return uuid response when reaction deletion is successful', async () => {
      // Given
      const user: UserDto = { uuid: 'user-1', nickname: 'UserOne' } as UserDto;
      const uuid = 'community-uuid';
      const fakeResponse: UuidResponseDto = { uuid };
      jest.spyOn(reactionService, 'reactionDeleteToCommunity').mockResolvedValue(fakeResponse);
      // When
      const result = await reactionController.communityReactionDelete(user, uuid);
      // Then
      expect(reactionService.reactionDeleteToCommunity).toHaveBeenCalledWith(user, uuid);
      expect(result).toEqual(fakeResponse);
    });
  });
});
