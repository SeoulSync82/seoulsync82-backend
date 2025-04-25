import { TestBed } from '@automock/jest';
import { CommentController } from 'src/comment/comment.controller';
import { CommentService } from 'src/comment/comment.service';
import { ApiCommentGetRequestQueryDto } from 'src/comment/dto/api-comment-get-request-query.dto';
import { ApiCommentGetResponseDto } from 'src/comment/dto/api-comment-get-response.dto';
import { ApiCommentPostRequestBodyDto } from 'src/comment/dto/api-community-post-request-body.dto';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { UserDto } from 'src/user/dto/user.dto';

describe('CommentController', () => {
  let commentController: CommentController;
  let commentService: jest.Mocked<CommentService>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(CommentController).compile();
    commentController = unit;
    commentService = unitRef.get(CommentService);
    jest.clearAllMocks();
  });

  describe('commentList', () => {
    it('should return comment list DTO when called with valid parameters', async () => {
      // Given
      const dummyCommunityUuid = 'community-uuid';
      const dummyDto: ApiCommentGetRequestQueryDto = { size: 5, last_id: 0 };
      const dummyUser = { uuid: 'user-uuid', nickname: 'TestUser' } as UserDto;
      const dummyResponse: ApiCommentGetResponseDto = {
        community_review: 'Great review',
        community_user_uuid: 'comm-user-uuid',
        community_user_name: 'CommUser',
        community_user_profile_image: 'img-comm',
        comments: [],
        last_item_id: 0,
      };
      jest.spyOn(commentService, 'commentList').mockResolvedValue(dummyResponse);

      // When
      const result = await commentController.commentList(dummyCommunityUuid, dummyDto, dummyUser);

      // Then
      expect(commentService.commentList).toHaveBeenCalledWith(
        dummyCommunityUuid,
        dummyDto,
        dummyUser,
      );
      expect(result).toEqual(dummyResponse);
    });
  });

  describe('commentPost', () => {
    it('should set req.notification and return only data part', async () => {
      // Given
      const dummyCommunityUuid = 'community-uuid';
      const dummyUser = { uuid: 'user-uuid', nickname: 'TestUser' } as UserDto;
      const dummyDto: ApiCommentPostRequestBodyDto = { comment: 'New comment' };
      const dummyUuid = 'generated-uuid';
      const dummyNotification = {
        uuid: 'notif-uuid',
        content: '회원님의 게시물에 TestUser님이 한줄평을 남겼어요.',
        target_type: 'comment',
        target_user_uuid: 'community-user-uuid',
        target_uuid: dummyCommunityUuid,
        user_uuid: dummyUser.uuid,
      };
      const dummyServiceResponse = {
        data: { uuid: dummyUuid },
        notification: dummyNotification,
      };
      jest.spyOn(commentService, 'commentPost').mockResolvedValue(dummyServiceResponse);
      const req: any = {};

      // When
      const result = await commentController.commentPost(
        dummyCommunityUuid,
        dummyUser,
        dummyDto,
        req,
      );

      // Then
      expect(commentService.commentPost).toHaveBeenCalledWith(
        dummyCommunityUuid,
        dummyUser,
        dummyDto,
      );
      expect(req.notification).toEqual(dummyNotification);
      expect(result).toEqual({ uuid: dummyUuid });
    });
  });

  describe('commentUpdate', () => {
    it('should return UuidResponseDto when comment is updated successfully', async () => {
      // Given
      const dummyCommentUuid = 'comment-uuid';
      const dummyUser = { uuid: 'user-uuid', nickname: 'TestUser' } as UserDto;
      const dummyDto = { comment: 'Updated comment' };
      const dummyResponse: UuidResponseDto = { uuid: dummyCommentUuid };
      jest.spyOn(commentService, 'commentUpdate').mockResolvedValue(dummyResponse);

      // When
      const result = await commentController.commentUpdate(dummyUser, dummyDto, dummyCommentUuid);

      // Then
      expect(commentService.commentUpdate).toHaveBeenCalledWith(
        dummyUser,
        dummyDto,
        dummyCommentUuid,
      );
      expect(result).toEqual(dummyResponse);
    });
  });

  describe('commentDelete', () => {
    it('should return UuidResponseDto when comment is deleted successfully', async () => {
      // Given
      const dummyCommentUuid = 'comment-uuid';
      const dummyUser = { uuid: 'user-uuid', nickname: 'TestUser' } as UserDto;
      const dummyResponse: UuidResponseDto = { uuid: dummyCommentUuid };
      jest.spyOn(commentService, 'commentDelete').mockResolvedValue(dummyResponse);

      // When
      const result = await commentController.commentDelete(dummyUser, dummyCommentUuid);

      // Then
      expect(commentService.commentDelete).toHaveBeenCalledWith(dummyUser, dummyCommentUuid);
      expect(result).toEqual(dummyResponse);
    });
  });
});
