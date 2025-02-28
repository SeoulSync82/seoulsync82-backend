import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { isNotEmpty } from 'class-validator';
import { BookmarkQueryRepository } from 'src/bookmark/bookmark.query.repository';
import { ERROR } from 'src/commons/constants/error';
import { CursorPaginatedResponseDto } from 'src/commons/dtos/cursor-paginated-response.dto';
import { LastItemIdResponseDto } from 'src/commons/dtos/last-item-id-response.dto';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { isEmpty } from 'src/commons/util/is/is-empty';
import { generateUUID } from 'src/commons/util/uuid';
import { CommunityQueryRepository } from 'src/community/community.query.repository';
import { ApiCommunityGetDetailResponseDto } from 'src/community/dto/api-community-get-detail-response.dto';
import { ApiCommunityGetMyCourseRequestQueryDto } from 'src/community/dto/api-community-get-my-course-request-query.dto';
import { ApiCommunityGetMyCourseResponseDto } from 'src/community/dto/api-community-get-my-course-response.dto';
import { ApiCommunityGetRequestQueryDto } from 'src/community/dto/api-community-get-request-query.dto';
import { ApiCommunityGetResponseDto } from 'src/community/dto/api-community-get-response.dto';
import { ApiCommunityPostReactionResponseDto } from 'src/community/dto/api-community-post-reaction-response.dto';
import { ApiCommunityPostRequestBodyDto } from 'src/community/dto/api-community-post-request-body.dto';
import { ApiCommunityPutRequestBodyDto } from 'src/community/dto/api-community-put-request-body.dto';
import { CommunityCoursePlaceDetailDto } from 'src/community/dto/community-course-place-detail.dto';
import { CommunityNotificationDetailDto } from 'src/community/dto/community-notification-detail.dto';
import { ReactionQueryRepository } from 'src/community/reaction.query.repository';
import { CourseQueryRepository } from 'src/course/course.query.repository';
import { CommunityEntity } from 'src/entities/community.entity';
import { CourseEntity } from 'src/entities/course.entity';
import { ReactionEntity } from 'src/entities/reaction.entity';
import { UserDto } from 'src/user/dto/user.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';

@Injectable()
export class CommunityService {
  constructor(
    private readonly communityQueryRepository: CommunityQueryRepository,
    private readonly bookmarkQueryRepository: BookmarkQueryRepository,
    private readonly courseQueryRepository: CourseQueryRepository,
    private readonly reactionQueryRepository: ReactionQueryRepository,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  async communityPost(
    uuid: string,
    user: UserDto,
    dto: ApiCommunityPostRequestBodyDto,
  ): Promise<UuidResponseDto> {
    const course = await this.courseQueryRepository.findOne(uuid);
    if (isEmpty(course)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const community = await this.communityQueryRepository.findCommunityByCourse(uuid, user);
    if (isNotEmpty(community)) {
      throw new ConflictException(ERROR.DUPLICATION);
    }

    const communityEntity = new CommunityEntity();
    communityEntity.uuid = generateUUID();
    communityEntity.course_uuid = uuid;
    communityEntity.user_name = user.nickname;
    communityEntity.user_uuid = user.uuid;
    communityEntity.course_name = course.course_name;
    communityEntity.review = dto.review;
    communityEntity.score = dto.score;

    await this.communityQueryRepository.save(communityEntity);

    return { uuid: communityEntity.uuid };
  }

  async communityMyCourseList(
    dto: ApiCommunityGetMyCourseRequestQueryDto,
    user: UserDto,
  ): Promise<LastItemIdResponseDto<ApiCommunityGetMyCourseResponseDto>> {
    const myCourseList: CourseEntity[] = await this.courseQueryRepository.findMyCourse(dto, user);
    if (myCourseList.length === 0) {
      return { items: [], last_item_id: 0 };
    }

    const myCommunity: CommunityEntity[] = await this.communityQueryRepository.myCommunity(user);

    const lastItemId =
      myCourseList.length === dto.size ? myCourseList[myCourseList.length - 1].id : 0;

    return {
      items: plainToInstance(ApiCommunityGetMyCourseResponseDto, myCourseList, {
        excludeExtraneousValues: true,
      }).map((courseDto) => ({
        ...courseDto,
        is_posted: myCommunity.map((item) => item.course_uuid).includes(courseDto.course_uuid),
      })),
      last_item_id: lastItemId,
    };
  }

  async communityList(
    dto: ApiCommunityGetRequestQueryDto,
    user: UserDto,
  ): Promise<CursorPaginatedResponseDto<ApiCommunityGetResponseDto>> {
    const [totalCount, communityResult] = await Promise.all([
      this.communityQueryRepository.countCommunity(),
      this.communityQueryRepository.findCommunityList(dto, user),
    ]);

    if (isEmpty(totalCount)) {
      return { items: [], total_count: 0, next_page: null };
    }

    const { communityList, nextCursor } = communityResult;

    const [courseList, userList] = await Promise.all([
      this.courseQueryRepository.findList(communityList.map((item) => item.course_uuid)),
      this.userQueryRepository.findUserList(communityList.map((item) => item.user_uuid)),
    ]);

    return {
      items: plainToInstance(ApiCommunityGetResponseDto, communityList, {
        excludeExtraneousValues: true,
      }).map((community) => {
        const relatedCourse = courseList.find((c) => c.uuid === community.course_uuid);
        const relatedUser = userList.find((u) => u.uuid === community.user_uuid);
        return {
          ...community,
          customs: relatedCourse?.customs,
          line: relatedCourse?.line,
          subway: relatedCourse?.subway,
          course_image: relatedCourse?.course_image,
          user_name: relatedUser?.name,
          user_profile_image: relatedUser?.profile_image,
        };
      }),
      total_count: totalCount,
      next_page: nextCursor,
    };
  }

  async communityDetail(uuid: string, user: UserDto): Promise<ApiCommunityGetDetailResponseDto> {
    const community: CommunityEntity = await this.communityQueryRepository.findOne(uuid);
    if (isEmpty(community)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const [bookmark, course, coursePlaces, reactions, communityUser] = await Promise.all([
      this.bookmarkQueryRepository.findMyCourse(community.course_uuid),
      this.courseQueryRepository.findOne(community.course_uuid),
      this.courseQueryRepository.findPlace(community.course_uuid),
      this.reactionQueryRepository.findCommunityDetailReaction(uuid),
      this.userQueryRepository.findOne(community.user_uuid),
    ]);

    return new ApiCommunityGetDetailResponseDto({
      uuid,
      course_uuid: community.course_uuid,
      user_uuid: communityUser.uuid,
      user_name: communityUser.name,
      user_profile_image: communityUser.profile_image,
      review: community.review,
      score: community.score,
      is_bookmarked: bookmark.map((item) => item.user_uuid).includes(user.uuid),
      course_name: community.course_name,
      course_image: course.course_image,
      subway: course.subway,
      count: coursePlaces.length,
      like: reactions.length,
      isLiked: reactions.map((item) => item.user_uuid).includes(user.uuid),
      place: plainToInstance(
        CommunityCoursePlaceDetailDto,
        coursePlaces.map((coursePlace) => ({
          ...coursePlace.place,
          sort: coursePlace.sort,
          uuid: coursePlace.place_uuid,
        })),
        { excludeExtraneousValues: true },
      ),
    });
  }

  async communityPut(
    user: UserDto,
    dto: ApiCommunityPutRequestBodyDto,
    uuid: string,
  ): Promise<UuidResponseDto> {
    const community: CommunityEntity = await this.communityQueryRepository.findOne(uuid);
    if (isEmpty(community) || community.user_uuid !== user.uuid) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    community.review = dto.review;
    community.score = dto.score;
    await this.communityQueryRepository.save(community);

    return { uuid };
  }

  async communityDelete(user: UserDto, uuid): Promise<UuidResponseDto> {
    const community: CommunityEntity = await this.communityQueryRepository.findOne(uuid);
    if (isEmpty(community) || community.user_uuid !== user.uuid) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    community.archived_at = new Date();
    await this.communityQueryRepository.save(community);

    return { uuid };
  }

  async communityReaction(
    user: UserDto,
    uuid: string,
  ): Promise<ApiCommunityPostReactionResponseDto> {
    const community = await this.communityQueryRepository.findOne(uuid);
    if (isEmpty(community)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }
    const reaction = await this.reactionQueryRepository.findOne(uuid, user);

    let notification: CommunityNotificationDetailDto | null = null;

    if (!reaction) {
      const reactionEntity = new ReactionEntity();
      reactionEntity.uuid = generateUUID();
      reactionEntity.target_uuid = uuid;
      reactionEntity.user_uuid = user.uuid;
      reactionEntity.user_name = user.nickname;
      reactionEntity.like = 1;
      await this.reactionQueryRepository.courseLike(reactionEntity);

      notification = {
        uuid: generateUUID(),
        user_uuid: user.uuid,
        target_uuid: community.uuid,
        target_user_uuid: community.user_uuid,
        content: `회원님의 게시물을 ${user.nickname}님이 좋아합니다.`,
      };
    } else if (reaction.like === 0) {
      await this.reactionQueryRepository.updateCourseLike(reaction);
    } else if (reaction.like === 1) {
      throw new ConflictException(ERROR.DUPLICATION);
    }

    return {
      data: { uuid },
      notification,
    };
  }

  async communityReactionDelete(user: UserDto, uuid: string): Promise<UuidResponseDto> {
    const community: CommunityEntity = await this.communityQueryRepository.findOne(uuid);
    if (isEmpty(community)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }
    const reaction: ReactionEntity = await this.reactionQueryRepository.findOne(uuid, user);
    if (!reaction) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    } else if (reaction.like === 1) {
      await this.reactionQueryRepository.updateCourseLikeDelete(reaction);
    } else if (reaction.like === 0) {
      throw new ConflictException(ERROR.DUPLICATION);
    }

    return { uuid };
  }
}
