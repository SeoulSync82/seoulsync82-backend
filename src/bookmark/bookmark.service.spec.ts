import { TestBed } from '@automock/jest';
import { NotFoundException } from '@nestjs/common';
import * as classTransformer from 'class-transformer';
import { CommentQueryRepository } from 'src/comment/comment.query.repository';
import { CommentService } from 'src/comment/comment.service';
import { ApiCommentGetRequestQueryDto } from 'src/comment/dto/api-comment-get-request-query.dto';
import { ApiCommentPostRequestBodyDto } from 'src/comment/dto/api-community-post-request-body.dto';
import { ApiCommentPutRequestBodyDto } from 'src/comment/dto/api-community-put-request-body.dto';
import { CommunityQueryRepository } from 'src/community/community.query.repository';
import { CommentEntity } from 'src/entities/comment.entity';
import { CommunityEntity } from 'src/entities/community.entity';
import { UserEntity } from 'src/entities/user.entity';
import { UserDto } from 'src/user/dto/user.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';

describe('CommentService', () => {
  let commentService: CommentService;
  let commentQueryRepository: jest.Mocked<CommentQueryRepository>;
  let communityQueryRepository: jest.Mocked<CommunityQueryRepository>;
  let userQueryRepository: jest.Mocked<UserQueryRepository>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(CommentService).compile();
    commentService = unit;
    commentQueryRepository = unitRef.get(CommentQueryRepository);
    communityQueryRepository = unitRef.get(CommunityQueryRepository);
    userQueryRepository = unitRef.get(UserQueryRepository);
    jest.clearAllMocks();
  });

  describe('commentList', () => {
    it('should throw NotFoundException when community not found', async () => {
      // Given
      const dummyCommunityUuid = 'community-uuid';
      const dto: ApiCommentGetRequestQueryDto = { size: 5, last_id: 0 };
      const dummyUser = {
        uuid: 'user-uuid',
        nickname: 'UserName',
        id: 1,
        profile_image: 'img-user',
      } as UserDto;
      communityQueryRepository.findOne.mockResolvedValue(null);

      // When & Then
      await expect(commentService.commentList(dummyCommunityUuid, dto, dummyUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return ApiCommentGetResponseDto when community and comments exist', async () => {
      // Given
      const dummyCommunityUuid = 'community-uuid';
      const dto: ApiCommentGetRequestQueryDto = { size: 2, last_id: 0 };
      const dummyUser = {
        uuid: 'user-uuid',
        nickname: 'UserName',
        id: 1,
        profile_image: 'img-user',
      } as UserDto;

      const dummyCommunity: CommunityEntity = {
        uuid: dummyCommunityUuid,
        review: 'Great community!',
        user_uuid: 'community-user-uuid',
        user_name: 'CommunityUser',
      } as CommunityEntity;

      const dummyComments: CommentEntity[] = [
        {
          id: 1,
          uuid: 'comment-1',
          user_uuid: 'user-uuid',
          comment: 'First comment',
        } as CommentEntity,
        {
          id: 2,
          uuid: 'comment-2',
          user_uuid: 'other-user-uuid',
          comment: 'Second comment',
        } as CommentEntity,
      ];

      const dummyUserList: UserEntity[] = [
        {
          id: 2,
          uuid: 'community-user-uuid',
          email: 'comm@example.com',
          name: 'CommunityUser',
          profile_image: 'img-community',
          type: 'kakao',
          refresh_token: null,
          created_at: new Date(),
          updated_at: new Date(),
        } as UserEntity,
        {
          id: 1,
          uuid: 'user-uuid',
          email: 'user@example.com',
          name: 'UserName',
          profile_image: 'img-user',
          type: 'kakao',
          refresh_token: null,
          created_at: new Date(),
          updated_at: new Date(),
        } as UserEntity,
        {
          id: 3,
          uuid: 'other-user-uuid',
          email: 'other@example.com',
          name: 'OtherUser',
          profile_image: 'img-other',
          type: 'kakao',
          refresh_token: null,
          created_at: new Date(),
          updated_at: new Date(),
        } as UserEntity,
      ];

      communityQueryRepository.findOne.mockResolvedValue(dummyCommunity);
      commentQueryRepository.find.mockResolvedValue(dummyComments);
      userQueryRepository.findUserList.mockResolvedValue(dummyUserList);

      // 여기서 plainToInstance를 개별적으로 목 처리
      jest.spyOn(classTransformer, 'plainToInstance').mockReturnValue({
        community_review: dummyCommunity.review,
        community_user_uuid: dummyCommunity.user_uuid,
        community_user_name: dummyCommunity.user_name,
        community_user_profile_image: dummyUserList.find((u) => u.uuid === dummyCommunity.user_uuid)
          ?.profile_image,
        comments: dummyComments.map((comment) => ({
          ...comment,
          user_profile_image: dummyUserList.find((u) => u.uuid === comment.user_uuid)
            ?.profile_image,
          isAuthor: comment.user_uuid === dummyUser.uuid,
        })),
        last_item_id:
          dummyComments.length === dto.size ? dummyComments[dummyComments.length - 1].id : 0,
      } as any);

      const expectedResponse = {
        community_review: dummyCommunity.review,
        community_user_uuid: dummyCommunity.user_uuid,
        community_user_name: dummyCommunity.user_name,
        community_user_profile_image: dummyUserList.find((u) => u.uuid === dummyCommunity.user_uuid)
          ?.profile_image,
        comments: dummyComments.map((comment) => ({
          ...comment,
          user_profile_image: dummyUserList.find((u) => u.uuid === comment.user_uuid)
            ?.profile_image,
          isAuthor: comment.user_uuid === dummyUser.uuid,
        })),
        last_item_id:
          dummyComments.length === dto.size ? dummyComments[dummyComments.length - 1].id : 0,
      };

      // When
      const result = await commentService.commentList(dummyCommunityUuid, dto, dummyUser);

      // Then
      expect(communityQueryRepository.findOne).toHaveBeenCalledWith(dummyCommunityUuid);
      expect(commentQueryRepository.find).toHaveBeenCalledWith(dummyCommunityUuid, dto);
      expect(userQueryRepository.findUserList).toHaveBeenCalledWith(
        Array.from(new Set([...dummyComments.map((c) => c.user_uuid), dummyCommunity.user_uuid])),
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('commentPost', () => {
    it('should throw NotFoundException when community not found', async () => {
      // Given
      const dummyCommunityUuid = 'community-uuid';
      const dummyUser = {
        uuid: 'user-uuid',
        nickname: 'UserName',
        id: 1,
        profile_image: 'img-user',
      } as UserDto;
      const dto: ApiCommentPostRequestBodyDto = { comment: 'New comment' };
      communityQueryRepository.findOne.mockResolvedValue(null);

      // When & Then
      await expect(commentService.commentPost(dummyCommunityUuid, dummyUser, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should save comment and return UuidResponseDto', async () => {
      // Given
      const dummyCommunityUuid = 'community-uuid';
      const dummyUser = {
        uuid: 'user-uuid',
        nickname: 'UserName',
        id: 1,
        profile_image: 'img-user',
      } as UserDto;
      const dto: ApiCommentPostRequestBodyDto = { comment: 'New comment' };
      const dummyCommunity: CommunityEntity = {
        uuid: dummyCommunityUuid,
        user_uuid: 'community-user-uuid',
      } as CommunityEntity;
      communityQueryRepository.findOne.mockResolvedValue(dummyCommunity);
      const generatedUUID = 'generated-uuid';
      jest.spyOn(global, 'generateUUID' as any).mockReturnValue(generatedUUID);
      commentQueryRepository.save.mockResolvedValue({} as CommentEntity);

      // When
      const result = await commentService.commentPost(dummyCommunityUuid, dummyUser, dto);

      // Then
      expect(communityQueryRepository.findOne).toHaveBeenCalledWith(dummyCommunityUuid);
      expect(commentQueryRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ uuid: generatedUUID });
    });
  });

  describe('commentUpdate', () => {
    it('should throw NotFoundException when comment not found', async () => {
      // Given
      const dummyCommentUuid = 'comment-uuid';
      const dummyUser = {
        uuid: 'user-uuid',
        nickname: 'UserName',
        id: 1,
        profile_image: 'img-user',
      } as UserDto;
      const dto: ApiCommentPutRequestBodyDto = { comment: 'Updated comment' };
      commentQueryRepository.findOne.mockResolvedValue(null);

      // When & Then
      await expect(commentService.commentUpdate(dummyUser, dto, dummyCommentUuid)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when user is not the author', async () => {
      // Given
      const dummyCommentUuid = 'comment-uuid';
      const dummyUser = {
        uuid: 'user-uuid',
        nickname: 'UserName',
        id: 1,
        profile_image: 'img-user',
      } as UserDto;
      const dto: ApiCommentPutRequestBodyDto = { comment: 'Updated comment' };
      const dummyComment: CommentEntity = {
        uuid: dummyCommentUuid,
        user_uuid: 'other-uuid',
        comment: 'Old comment',
      } as CommentEntity;
      commentQueryRepository.findOne.mockResolvedValue(dummyComment);

      // When & Then
      await expect(commentService.commentUpdate(dummyUser, dto, dummyCommentUuid)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update comment and return UuidResponseDto', async () => {
      // Given
      const dummyCommentUuid = 'comment-uuid';
      const dummyUser = {
        uuid: 'user-uuid',
        nickname: 'UserName',
        id: 1,
        profile_image: 'img-user',
      } as UserDto;
      const dto: ApiCommentPutRequestBodyDto = { comment: 'Updated comment' };
      const dummyComment: CommentEntity = {
        uuid: dummyCommentUuid,
        user_uuid: dummyUser.uuid,
        comment: 'Old comment',
      } as CommentEntity;
      commentQueryRepository.findOne.mockResolvedValue(dummyComment);
      commentQueryRepository.save.mockResolvedValue({
        ...dummyComment,
        comment: dto.comment,
      } as CommentEntity);

      // When
      const result = await commentService.commentUpdate(dummyUser, dto, dummyCommentUuid);

      // Then
      expect(commentQueryRepository.findOne).toHaveBeenCalledWith(dummyCommentUuid);
      expect(commentQueryRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ uuid: dummyCommentUuid });
    });
  });

  describe('commentDelete', () => {
    it('should throw NotFoundException when comment not found', async () => {
      // Given
      const dummyCommentUuid = 'comment-uuid';
      const dummyUser = {
        uuid: 'user-uuid',
        nickname: 'UserName',
        id: 1,
        profile_image: 'img-user',
      } as UserDto;
      commentQueryRepository.findOne.mockResolvedValue(null);

      // When & Then
      await expect(commentService.commentDelete(dummyUser, dummyCommentUuid)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when user is not the author', async () => {
      // Given
      const dummyCommentUuid = 'comment-uuid';
      const dummyUser = {
        uuid: 'user-uuid',
        nickname: 'UserName',
        id: 1,
        profile_image: 'img-user',
      } as UserDto;
      const dummyComment: CommentEntity = {
        uuid: dummyCommentUuid,
        user_uuid: 'other-uuid',
        comment: 'Some comment',
      } as CommentEntity;
      commentQueryRepository.findOne.mockResolvedValue(dummyComment);

      // When & Then
      await expect(commentService.commentDelete(dummyUser, dummyCommentUuid)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should mark comment as deleted and return UuidResponseDto', async () => {
      // Given
      const dummyCommentUuid = 'comment-uuid';
      const dummyUser = {
        uuid: 'user-uuid',
        nickname: 'UserName',
        id: 1,
        profile_image: 'img-user',
      } as UserDto;
      const dummyComment: CommentEntity = {
        uuid: dummyCommentUuid,
        user_uuid: dummyUser.uuid,
        comment: 'Some comment',
      } as CommentEntity;
      commentQueryRepository.findOne.mockResolvedValue(dummyComment);
      commentQueryRepository.save.mockResolvedValue({
        ...dummyComment,
        archived_at: new Date(),
      } as CommentEntity);

      // When
      const result = await commentService.commentDelete(dummyUser, dummyCommentUuid);

      // Then
      expect(commentQueryRepository.findOne).toHaveBeenCalledWith(dummyCommentUuid);
      expect(commentQueryRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ uuid: dummyCommentUuid });
    });
  });
});
