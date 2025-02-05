import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { isNotEmpty } from 'class-validator';
import { ERROR } from 'src/auth/constants/error';
import { BookmarkQueryRepository } from 'src/bookmark/bookmark.query.repository';
import { DetailResponseDto } from 'src/commons/dto/response.dto';
import { isEmpty } from 'src/commons/util/is/is-empty';
import { generateUUID } from 'src/commons/util/uuid';
import { CourseQueryRepository } from 'src/course/course.query.repository';
import { CoursePlaceDto } from 'src/course/dto/course.dto';
import { CommunityEntity } from 'src/entities/community.entity';
import { CourseEntity } from 'src/entities/course.entity';
import { ReactionEntity } from 'src/entities/reaction.entity';
import { UserEntity } from 'src/entities/user.entity';
import { UserDto } from 'src/user/dto/user.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { CommunityQueryRepository } from './community.query.repository';
import { ApiCommunityGetDetailResponseDto } from './dto/api-community-get-detail-response.dto';
import { ApiCommunityGetMyCourseRequestQueryDto } from './dto/api-community-get-my-course-request-query.dto';
import { ApiCommunityGetMyCourseResponseDto } from './dto/api-community-get-my-course-response.dto';
import { ApiCommunityGetRequestQueryDto } from './dto/api-community-get-request-query.dto';
import { ApiCommunityGetResponseDto } from './dto/api-community-get-response.dto';
import { ApiCommunityPostRequestBodyDto } from './dto/api-community-post-request-body.dto';
import { CommunityPutReqDto } from './dto/community.dto';
import { ReactionQueryRepository } from './reaction.query.repository';

@Injectable()
export class CommunityService {
  constructor(
    private readonly communityQueryRepository: CommunityQueryRepository,
    private readonly bookmarkQueryRepository: BookmarkQueryRepository,
    private readonly courseQueryRepository: CourseQueryRepository,
    private readonly reactionQueryRepository: ReactionQueryRepository,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  async communityPost(uuid, user: UserDto, dto: ApiCommunityPostRequestBodyDto) {
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

    return DetailResponseDto.uuid(communityEntity.uuid);
  }

  async communityMyCourseList(dto: ApiCommunityGetMyCourseRequestQueryDto, user: UserDto) {
    const myCourseList: CourseEntity[] = await this.courseQueryRepository.findMyCourse(dto, user);
    if (myCourseList.length === 0) {
      return { items: [] };
    }

    const myCommunity: CommunityEntity[] = await this.communityQueryRepository.myCommunity(user);

    const apiCommunityMyCourseGetResponseDto = plainToInstance(
      ApiCommunityGetMyCourseResponseDto,
      myCourseList,
      {
        excludeExtraneousValues: true,
      },
    ).map((my) => {
      my.is_posted = myCommunity.map((item) => item.course_uuid).includes(my.course_uuid);
      return my;
    });

    const last_item_id =
      myCourseList.length === dto.size ? myCourseList[myCourseList.length - 1].id : 0;

    return { items: apiCommunityMyCourseGetResponseDto, last_item_id };
  }

  async communityList(dto: ApiCommunityGetRequestQueryDto, user) {
    const totalCount: number = await this.communityQueryRepository.countCommunity();
    if (totalCount === 0) {
      return { items: [], total_count: 0, next_page: null };
    }

    const { communityList, nextCursor } = await this.communityQueryRepository.findCommunityList(
      dto,
      user,
    );

    const courseList: CourseEntity[] = await this.courseQueryRepository.findList(
      communityList.map((item) => item.course_uuid),
    );

    const userList = await this.userQueryRepository.findUserList(
      communityList.map((item) => item.user_uuid),
    );

    return {
      items: plainToInstance(ApiCommunityGetResponseDto, communityList, {
        excludeExtraneousValues: true,
      }).map((community) => {
        community.customs = courseList.find((item) => item.uuid === community.course_uuid).customs;
        community.line = courseList.find((item) => item.uuid === community.course_uuid).line;
        community.subway = courseList.find((item) => item.uuid === community.course_uuid).subway;
        community.course_image = courseList.find(
          (item) => item.uuid === community.course_uuid,
        ).course_image;
        community.user_name = userList.find((user) => user.uuid === community.user_uuid).name;
        community.user_profile_image = userList.find(
          (user) => user.uuid === community.user_uuid,
        ).profile_image;
        return community;
      }),
      total_count: totalCount,
      next_page: nextCursor,
    };
  }

  async communityDetail(uuid, user) {
    const community: CommunityEntity = await this.communityQueryRepository.findOne(uuid);
    if (isEmpty(community)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const bookmark = await this.bookmarkQueryRepository.findMyCourse(community.course_uuid);
    const course = await this.courseQueryRepository.findOne(community.course_uuid);
    const coursePlaces = await this.courseQueryRepository.findPlace(community.course_uuid);

    const reaction: ReactionEntity[] =
      await this.reactionQueryRepository.findCommunityDetailReaction(uuid);
    const communityUser: UserEntity = await this.userQueryRepository.findOne(community.user_uuid);

    const apiCommunityDetailGetResponseDto = new ApiCommunityGetDetailResponseDto({
      uuid: uuid,
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
      like: reaction.length,
      isLiked: reaction.map((item) => item.user_uuid).includes(user.uuid),
      place: plainToInstance(
        CoursePlaceDto,
        coursePlaces.map((coursePlace) => ({
          ...coursePlace.place,
          sort: coursePlace.sort,
          uuid: coursePlace.place_uuid,
        })),
        {
          excludeExtraneousValues: true,
        },
      ),
    });

    return apiCommunityDetailGetResponseDto;
  }

  async communityPut(user: UserDto, dto: CommunityPutReqDto, uuid) {
    const community: CommunityEntity = await this.communityQueryRepository.findOne(uuid);
    if (isEmpty(community) || community.user_uuid !== user.uuid) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    community.review = dto.review;
    community.score = dto.score;

    await this.communityQueryRepository.save(community);

    return DetailResponseDto.uuid(uuid);
  }

  async communityDelete(user: UserDto, uuid) {
    const community: CommunityEntity = await this.communityQueryRepository.findOne(uuid);
    if (isEmpty(community) || community.user_uuid !== user.uuid) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    community.archived_at = new Date();

    await this.communityQueryRepository.save(community);

    return DetailResponseDto.uuid(uuid);
  }

  async communityReaction(user: UserDto, uuid) {
    const community: CommunityEntity = await this.communityQueryRepository.findOne(uuid);
    if (isEmpty(community)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }
    const reaction: ReactionEntity = await this.reactionQueryRepository.findOne(uuid, user);

    let notification = {};

    const reactionEntity = new ReactionEntity();
    if (!reaction) {
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

    return DetailResponseDto.notification({ uuid }, notification);
  }

  async communityReactionDelete(user: UserDto, uuid) {
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

    return DetailResponseDto.uuid(uuid);
  }
}
