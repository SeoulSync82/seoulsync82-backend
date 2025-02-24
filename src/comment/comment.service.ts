import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from '../commons/constants/error';
import { DetailResponseDto } from '../commons/dto/response.dto';
import { isEmpty } from '../commons/util/is/is-empty';
import { generateUUID } from '../commons/util/uuid';
import { CommunityQueryRepository } from '../community/community.query.repository';
import { CourseQueryRepository } from '../course/course.query.repository';
import { CommentEntity } from '../entities/comment.entity';
import { CommunityEntity } from '../entities/community.entity';
import { UserEntity } from '../entities/user.entity';
import { UserDto } from '../user/dto/user.dto';
import { UserQueryRepository } from '../user/user.query.repository';
import { CommentQueryRepository } from './comment.query.repository';
import { ApiCommentGetRequestQueryDto } from './dto/api-comment-get-request-query.dto';
import { ApiCommentGetResponseDto, CommentListDto } from './dto/api-comment-get-response.dto';
import { ApiCommentPostRequestBodyDto } from './dto/api-community-post-request-body.dto';
import { ApiCommentPutRequestBodyDto } from './dto/api-community-put-request-body.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentQueryRepository: CommentQueryRepository,
    private readonly courseQueryRepository: CourseQueryRepository,
    private readonly communityQueryRepository: CommunityQueryRepository,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  async commentList(uuid, dto: ApiCommentGetRequestQueryDto, user: UserDto) {
    const community: CommunityEntity = await this.communityQueryRepository.findOne(uuid);
    if (isEmpty(community)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const comments: CommentEntity[] = await this.commentQueryRepository.find(uuid, dto);

    const userUuids: string[] = comments.map((comment) => comment.user_uuid);
    userUuids.push(community.user_uuid);

    const userList: UserEntity[] = await this.userQueryRepository.findUserList(userUuids);

    const apiCommentGetResponseDto: ApiCommentGetResponseDto = {
      community_review: community.review,
      community_user_uuid: community.user_uuid,
      community_user_name: community.user_name,
      community_user_profile_image: userList.find((user) => user.uuid === community.user_uuid)
        .profile_image,
      comments: plainToInstance(
        CommentListDto,
        comments.map((comment) => ({
          ...comment,
          user_profile_image: userList.find((user) => user.uuid === comment.user_uuid)
            .profile_image,
          isAuthor: comment.user_uuid === user.uuid,
        })),
        { excludeExtraneousValues: true },
      ),
      last_id: comments.length === dto.size ? comments[comments.length - 1].id : 0,
    };
    return { items: apiCommentGetResponseDto };
  }

  async commentPost(uuid, user: UserDto, dto: ApiCommentPostRequestBodyDto) {
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

    return DetailResponseDto.uuid(commentEntity.uuid);
  }

  async commentUpdate(user: UserDto, dto: ApiCommentPutRequestBodyDto, uuid) {
    const comment: CommentEntity = await this.commentQueryRepository.findOne(uuid);
    if (isEmpty(comment) || comment.user_uuid !== user.uuid) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    comment.comment = dto.comment;

    await this.commentQueryRepository.save(comment);

    return DetailResponseDto.uuid(comment.uuid);
  }

  async commentDelete(user: UserDto, uuid) {
    const comment: CommentEntity = await this.commentQueryRepository.findOne(uuid);
    if (isEmpty(comment) || comment.user_uuid !== user.uuid) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    comment.archived_at = new Date();

    await this.commentQueryRepository.save(comment);

    return DetailResponseDto.uuid(comment.uuid);
  }
}
