import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ERROR } from 'src/commons/constants/error';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { isEmpty } from 'src/commons/util/is/is-empty';
import { generateUUID } from 'src/commons/util/uuid';
import { CommunityQueryRepository } from 'src/community/community.query.repository';
import { CommunityEntity } from 'src/entities/community.entity';
import { ReactionEntity } from 'src/entities/reaction.entity';
import { NotificationDetailDto } from 'src/notification/dto/notification-detail.dto';
import { ApiReactionPostCommunityResponseDto } from 'src/reaction/dto/api-reaction-post-community-response.dto';
import { ReactionQueryRepository } from 'src/reaction/reaction.query.repository';
import { UserDto } from 'src/user/dto/user.dto';

@Injectable()
export class ReactionService {
  constructor(
    private readonly communityQueryRepository: CommunityQueryRepository,
    private readonly reactionQueryRepository: ReactionQueryRepository,
  ) {}

  async reactionToCommunity(
    user: UserDto,
    uuid: string,
  ): Promise<ApiReactionPostCommunityResponseDto> {
    const community = await this.communityQueryRepository.findOne(uuid);
    if (isEmpty(community)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }
    const reaction = await this.reactionQueryRepository.findOne(uuid, user);

    if (reaction) {
      if (reaction.like === 1) {
        throw new ConflictException(ERROR.DUPLICATION);
      }

      if (reaction.like === 0) {
        await this.reactionQueryRepository.updateCourseLike(reaction);
        return { data: { uuid }, notification: null };
      }
    }

    const newReaction = new ReactionEntity();
    newReaction.uuid = generateUUID();
    newReaction.target_uuid = uuid;
    newReaction.user_uuid = user.uuid;
    newReaction.user_name = user.nickname;
    newReaction.like = 1;
    await this.reactionQueryRepository.courseLike(newReaction);

    const notification: NotificationDetailDto = {
      uuid: generateUUID(),
      user_uuid: user.uuid,
      target_type: 'reaction',
      target_uuid: community.uuid,
      target_user_uuid: community.user_uuid,
      content: `회원님의 게시물을 ${user.nickname}님이 좋아합니다.`,
    };

    return { data: { uuid }, notification };
  }

  async reactionDeleteToCommunity(user: UserDto, uuid: string): Promise<UuidResponseDto> {
    const community: CommunityEntity = await this.communityQueryRepository.findOne(uuid);

    const reaction: ReactionEntity = await this.reactionQueryRepository.findOne(uuid, user);
    if (isEmpty(reaction) || isEmpty(community)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    if (reaction.like === 0) {
      throw new ConflictException(ERROR.DUPLICATION);
    }

    await this.reactionQueryRepository.updateCourseLikeDelete(reaction);

    return { uuid };
  }
}
