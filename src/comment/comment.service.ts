import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentQueryRepository } from './comment.query.repository';
import { UserDto } from '../user/dto/user.dto';
import { ApiCommentPostRequestBodyDto } from './dto/api-community-post-request-body.dto';
import { CourseQueryRepository } from '../course/course.query.repository';
import { CommunityQueryRepository } from '../community/community.query.repository';
import { ERROR } from '../auth/constants/error';
import { CommunityEntity } from '../entities/community.entity';
import { isEmpty } from '../commons/util/is/is-empty';
import { CommentEntity } from '../entities/comment.entity';
import { generateUUID } from '../commons/util/uuid';
import { DetailResponseDto } from '../commons/dto/response.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentQueryRepository: CommentQueryRepository,
    private readonly courseQueryRepository: CourseQueryRepository,
    private readonly communityQueryRepository: CommunityQueryRepository,
  ) {}

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

  findAll() {
    return `This action returns all comment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
