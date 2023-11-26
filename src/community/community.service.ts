import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/auth/constants/error';
import { DetailResponseDto, ResponseDataDto } from 'src/commons/dto/response.dto';
import { generateUUID } from 'src/commons/util/uuid';
import { CommunityEntity } from 'src/entities/community.entity';
import { MyCourseEntity } from 'src/entities/my_course.entity';
import { MyCourseQueryRepository } from 'src/my_course/my_course.query.repository';
import { CommunityController } from './community.controller';
import { CommunityQueryRepository } from './community.query.repository';
import { CommunityListResDto, CommunityPostReqDto } from './dto/community.dto';

@Injectable()
export class CommunityService {
  constructor(
    private readonly communityQueryRepository: CommunityQueryRepository,
    private readonly myCourseQueryRepository: MyCourseQueryRepository,
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

  async communityList(dto, user) {
    const communityList: CommunityEntity[] = await this.communityQueryRepository.find(dto, user);
    if (communityList.length === 0) {
      return ResponseDataDto.from([], null, 0);
    }

    const courseList: MyCourseEntity[] = await this.myCourseQueryRepository.findList(
      communityList.map((item) => item.my_course_uuid),
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
      return community;
    });

    const last_item_id = communityList.length > 0 ? communityList[communityList.length - 1].id : 0;

    return ResponseDataDto.from(communityListResDto, null, last_item_id);
  }
}
