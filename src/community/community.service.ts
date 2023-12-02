import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import e from 'express';
import { ERROR } from 'src/auth/constants/error';
import { DetailResponseDto, ResponseDataDto } from 'src/commons/dto/response.dto';
import { generateUUID } from 'src/commons/util/uuid';
import { CourseQueryRepository } from 'src/course/course.query.repository';
import { MyCourseDetailResDto, CoursePlaceDto } from 'src/course/dto/course.dto';
import { CommunityEntity } from 'src/entities/community.entity';
import { MyCourseEntity } from 'src/entities/my_course.entity';
import { ReactionEntity } from 'src/entities/reaction.entity';
import { MyCourseQueryRepository } from 'src/my_course/my_course.query.repository';
import { CommunityController } from './community.controller';
import { CommunityQueryRepository } from './community.query.repository';
import {
  CommunityDetailResDto,
  CommunityListReqDto,
  CommunityListResDto,
  CommunityPostReqDto,
  CommunityPutReqDto,
} from './dto/community.dto';
import { ReactionQueryRepository } from './reaction.query.repository';

@Injectable()
export class CommunityService {
  constructor(
    private readonly communityQueryRepository: CommunityQueryRepository,
    private readonly myCourseQueryRepository: MyCourseQueryRepository,
    private readonly courseQueryRepository: CourseQueryRepository,
    private readonly reactionQueryRepository: ReactionQueryRepository,
  ) {}

  async communityPost(user, dto: CommunityPostReqDto) {
    const myCourse = await this.myCourseQueryRepository.findOne(dto.my_course_uuid);
    if (!myCourse) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const communityEntity = new CommunityEntity();
    communityEntity.uuid = generateUUID();
    communityEntity.user_name = user.nickname;
    communityEntity.user_uuid = user.uuid;
    communityEntity.my_course_uuid = myCourse.uuid;
    communityEntity.my_course_name = myCourse.course_name;
    communityEntity.review = dto.review;
    communityEntity.score = dto.score;

    await this.communityQueryRepository.save(communityEntity);

    return DetailResponseDto.uuid(communityEntity.uuid);
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

    const courseList: MyCourseEntity[] = await this.myCourseQueryRepository.findList(
      communityList.map((item) => item.my_course_uuid),
    );

    const reaction = await this.reactionQueryRepository.findCommunityReaction(
      communityList.map((item) => item.uuid),
    );

    const communityListResDto = plainToInstance(CommunityListResDto, communityList, {
      excludeExtraneousValues: true,
    }).map((community) => {
      community.course_uuid = courseList.find(
        (item) => item.uuid === community.my_course_uuid,
      ).course_uuid;
      community.line = courseList.find((item) => item.uuid === community.my_course_uuid).line;
      community.subway = courseList.find((item) => item.uuid === community.my_course_uuid).subway;
      community.course_image = courseList.find(
        (item) => item.uuid === community.my_course_uuid,
      ).course_image;
      community.like = reaction.filter((item) => item.target_uuid === community.uuid).length;
      community.isLiked = reaction
        .filter((item) => item.target_uuid === community.uuid)
        .map((user) => user.user_uuid)
        .includes(user.uuid);
      return community;
    });

    const last_item_id = communityList.length > 0 ? communityList[communityList.length - 1].id : 0;

    return ResponseDataDto.from(communityListResDto, null, last_item_id);
  }

  async communityDetail(uuid, user) {
    const community: CommunityEntity = await this.communityQueryRepository.findOne(uuid);
    if (!community) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const course = await this.myCourseQueryRepository.findOne(community.my_course_uuid);
    if (!course) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const coursePlaces = await this.courseQueryRepository.findPlace(course.course_uuid);
    const reaction = await this.reactionQueryRepository.findCommunityDetailReaction(uuid);

    const communityDetailResDto = new CommunityDetailResDto({
      course_uuid: course.course_uuid,
      my_course_uuid: course.uuid,
      my_course_name: course.course_name,
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

    return DetailResponseDto.from(communityDetailResDto);
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
