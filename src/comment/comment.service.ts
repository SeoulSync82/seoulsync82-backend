import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CommentQueryRepository } from 'src/comment/comment.query.repository';
import { ApiCommentGetRequestQueryDto } from 'src/comment/dto/api-comment-get-request-query.dto';
import { ApiCommentGetResponseDto } from 'src/comment/dto/api-comment-get-response.dto';
import { ApiCommentPostNotificationResponseDto } from 'src/comment/dto/api-comment-post-notification-response.dto';
import { ApiCommentPostRequestBodyDto } from 'src/comment/dto/api-community-post-request-body.dto';
import { ApiCommentPutRequestBodyDto } from 'src/comment/dto/api-community-put-request-body.dto';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { isEmpty } from 'src/commons/util/is/is-empty';
import { generateUUID } from 'src/commons/util/uuid';
import { CommunityQueryRepository } from 'src/community/community.query.repository';
import { CommentEntity } from 'src/entities/comment.entity';
import { CommunityEntity } from 'src/entities/community.entity';
import { UserEntity } from 'src/entities/user.entity';
import { NotificationDetailDto } from 'src/notification/dto/notification-detail.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { ERROR } from '../commons/constants/error';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentQueryRepository: CommentQueryRepository,
    private readonly communityQueryRepository: CommunityQueryRepository,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  async commentList(
    uuid: string,
    dto: ApiCommentGetRequestQueryDto,
    user: UserDto,
  ): Promise<ApiCommentGetResponseDto> {
    const community: CommunityEntity = await this.communityQueryRepository.findOne(uuid);
    if (isEmpty(community)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const comments: CommentEntity[] = await this.commentQueryRepository.find(uuid, dto);

    const userUuids = Array.from(
      new Set([...comments.map((comment) => comment.user_uuid), community.user_uuid]),
    );

    const userList: UserEntity[] = await this.userQueryRepository.findUserList(userUuids);

    return plainToInstance(
      ApiCommentGetResponseDto,
      {
        community_review: community.review,
        community_user_uuid: community.user_uuid,
        community_user_name: community.user_name,
        community_user_profile_image: userList.find((u) => u.uuid === community.user_uuid)
          .profile_image,
        comments: comments.map((comment) => ({
          ...comment,
          user_profile_image: userList.find((u) => u.uuid === comment.user_uuid).profile_image,
          isAuthor: comment.user_uuid === user.uuid,
        })),
        last_item_id: comments.length === dto.size ? comments[comments.length - 1].id : 0,
      },
      { excludeExtraneousValues: true },
    );
  }

  async commentPost(
    uuid: string,
    user: UserDto,
    dto: ApiCommentPostRequestBodyDto,
  ): Promise<ApiCommentPostNotificationResponseDto> {
    const community: CommunityEntity = await this.communityQueryRepository.findOne(uuid);
    if (isEmpty(community)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const commentEntity = new CommentEntity();
    commentEntity.uuid = generateUUID();
    commentEntity.user_uuid = user.uuid;
    commentEntity.user_name = user.nickname;
    commentEntity.comment = dto.comment;
    commentEntity.target_uuid = community.uuid;
    commentEntity.target_user_uuid = community.user_uuid;
    await this.commentQueryRepository.save(commentEntity);

    const notification: NotificationDetailDto = {
      uuid: generateUUID(),
      user_uuid: user.uuid,
      target_type: 'comment',
      target_uuid: community.uuid,
      target_user_uuid: community.user_uuid,
      content: `회원님의 게시물에 ${user.nickname}님이 한줄평을 남겼어요.`,
    };

    return {
      data: { uuid: commentEntity.uuid },
      notification,
    };
  }

  async commentUpdate(
    user: UserDto,
    dto: ApiCommentPutRequestBodyDto,
    uuid: string,
  ): Promise<UuidResponseDto> {
    const comment: CommentEntity = await this.commentQueryRepository.findOne(uuid);
    if (isEmpty(comment) || comment.user_uuid !== user.uuid) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const updatedComment = { ...comment, comment: dto.comment };

    await this.commentQueryRepository.save(updatedComment as CommentEntity);
    return { uuid: updatedComment.uuid };
  }

  async commentDelete(user: UserDto, uuid: string): Promise<UuidResponseDto> {
    const comment: CommentEntity = await this.commentQueryRepository.findOne(uuid);
    if (isEmpty(comment) || comment.user_uuid !== user.uuid) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const updatedComment = { ...comment, archived_at: new Date() };

    await this.commentQueryRepository.save(updatedComment as CommentEntity);
    return { uuid: updatedComment.uuid };
  }
}
