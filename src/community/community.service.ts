import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { isNotEmpty } from 'class-validator';
import e from 'express';
import { ERROR } from 'src/auth/constants/error';
import { DetailResponseDto, ResponseDataDto } from 'src/commons/dto/response.dto';
import { generateUUID } from 'src/commons/util/uuid';
import { CourseQueryRepository } from 'src/course/course.query.repository';
import { CoursePlaceDto } from 'src/course/dto/course.dto';
import { CommunityEntity } from 'src/entities/community.entity';
import { BookmarkEntity } from 'src/entities/bookmark.entity';
import { ReactionEntity } from 'src/entities/reaction.entity';
import { UserEntity } from 'src/entities/user.entity';
import { BookmarkQueryRepository } from 'src/bookmark/bookmark.query.repository';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { CommunityController } from './community.controller';
import { CommunityQueryRepository } from './community.query.repository';
import {
  CommunityDetailResDto,
  CommunityListReqDto,
  CommunityListResDto,
  CommunityMyCourseListResDto,
  CommunityPostReqDto,
  CommunityPutReqDto,
} from './dto/community.dto';
import { ReactionQueryRepository } from './reaction.query.repository';
import { CourseEntity } from 'src/entities/course.entity';

@Injectable()
export class CommunityService {
  constructor(
    private readonly communityQueryRepository: CommunityQueryRepository,
    private readonly bookmarkQueryRepository: BookmarkQueryRepository,
    private readonly courseQueryRepository: CourseQueryRepository,
    private readonly reactionQueryRepository: ReactionQueryRepository,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  async communityPost(uuid, user, dto: CommunityPostReqDto) {
    const course = await this.courseQueryRepository.findOne(uuid);
    if (!course) {
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

  async communityMyCourseList(dto, user) {
    const myCourseList: CourseEntity[] = await this.courseQueryRepository.findMyCourse(dto, user);
    if (myCourseList.length === 0) {
      return ResponseDataDto.from([], null, 0);
    }

    const myCommunity: CommunityEntity[] = await this.communityQueryRepository.myCommunity(user);

    const communityMyCourseList = plainToInstance(CommunityMyCourseListResDto, myCourseList, {
      excludeExtraneousValues: true,
    }).map((my) => {
      my.isPosted = myCommunity.map((item) => item.course_uuid).includes(my.course_uuid);
      return my;
    });

    const last_item_id =
      myCourseList.length === dto.size ? myCourseList[myCourseList.length - 1].id : 0;

    return { items: communityMyCourseList, last_item_id };
  }

  async communityList(dto: CommunityListReqDto, user) {
    let communityList: CommunityEntity[];
    if (dto.me === true) {
      communityList = await this.communityQueryRepository.findMyCommunity(dto, user);
    } else {
      communityList = await this.communityQueryRepository.find(dto);
    }

    if (communityList.length === 0) {
      return ResponseDataDto.from([], null, 0);
    }

    const courseList: CourseEntity[] = await this.courseQueryRepository.findList(
      communityList.map((item) => item.course_uuid),
    );

    const reaction = await this.reactionQueryRepository.findCommunityReaction(
      communityList.map((item) => item.uuid),
    );

    const userList = await this.userQueryRepository.findUserList(
      communityList.map((item) => item.user_uuid),
    );

    const communityListResDto = plainToInstance(CommunityListResDto, communityList, {
      excludeExtraneousValues: true,
    }).map((community) => {
      community.course_uuid = courseList.find((item) => item.uuid === community.course_uuid).uuid;
      community.line = courseList.find((item) => item.uuid === community.course_uuid).line;
      community.subway = courseList.find((item) => item.uuid === community.course_uuid).subway;
      community.course_image = courseList.find(
        (item) => item.uuid === community.course_uuid,
      ).course_image;
      community.course_name = courseList.find(
        (item) => item.uuid === community.course_uuid,
      ).course_name;
      community.like = reaction.filter((item) => item.target_uuid === community.uuid).length;
      community.isLiked = reaction
        .filter((item) => item.target_uuid === community.uuid)
        .map((user) => user.user_uuid)
        .includes(user.uuid);
      community.user_name = userList.find((user) => user.uuid === community.user_uuid).name;
      community.user_profile_image = userList.find(
        (user) => user.uuid === community.user_uuid,
      ).profile_image;
      return community;
    });

    const last_item_id =
      communityList.length === dto.size ? communityList[communityList.length - 1].id : 0;

    return { items: communityListResDto, last_item_id };
  }

  async communityDetail(uuid, user) {
    const community: CommunityEntity = await this.communityQueryRepository.findOne(uuid);
    if (!community) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const bookmark = await this.bookmarkQueryRepository.findMyCourse(community.course_uuid);
    const course = await this.courseQueryRepository.findOne(community.course_uuid);
    const coursePlaces = await this.courseQueryRepository.findPlace(community.course_uuid);

    const reaction: ReactionEntity[] =
      await this.reactionQueryRepository.findCommunityDetailReaction(uuid);
    const communityUser: UserEntity = await this.userQueryRepository.findOne(community.user_uuid);

    const communityDetailResDto = new CommunityDetailResDto({
      uuid: uuid,
      course_uuid: community.course_uuid,
      user_uuid: communityUser.uuid,
      user_name: communityUser.name,
      user_profile_image: communityUser.profile_image,
      review: community.review,
      isBookmarked: bookmark.map((item) => item.user_uuid).includes(user.uuid),
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

    return communityDetailResDto;
  }

  async communityPut(user, dto: CommunityPutReqDto, uuid) {
    const community: CommunityEntity = await this.communityQueryRepository.findOne(uuid);
    if (!community || community.user_uuid !== user.uuid) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    community.review = dto.review;
    community.score = dto.score;

    await this.communityQueryRepository.save(community);

    return DetailResponseDto.uuid(uuid);
  }

  async communityDelete(user, uuid) {
    const community: CommunityEntity = await this.communityQueryRepository.findOne(uuid);
    if (!community || community.user_uuid !== user.uuid) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    community.archived_at = new Date();

    await this.communityQueryRepository.save(community);

    return DetailResponseDto.uuid(uuid);
  }

  async communityReaction(user, uuid) {
    const community: CommunityEntity = await this.communityQueryRepository.findOne(uuid);
    if (!community) {
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

  async communityReactionDelete(user, uuid) {
    const community: CommunityEntity = await this.communityQueryRepository.findOne(uuid);
    if (!community) {
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
