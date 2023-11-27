import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { retry } from 'rxjs';
import { ERROR } from 'src/auth/constants/error';
import { DetailResponseDto, ResponseDataDto } from 'src/commons/dto/response.dto';
import { generateUUID } from 'src/commons/util/uuid';
import { CourseModule } from 'src/course/course.module';
import { CourseQueryRepository } from 'src/course/course.query.repository';
import {
  CoursePlaceDto,
  CourseRecommendResDto,
  MyCourseDetailResDto,
} from 'src/course/dto/course.dto';
import { MyCourseEntity } from 'src/entities/my_course.entity';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { MyCourseListResDto } from './dto/my_course.dto';
import { MyCourseQueryRepository } from './my_course.query.repository';

@Injectable()
export class MyCourseService {
  constructor(
    private readonly myCourseQueryRepository: MyCourseQueryRepository,
    private readonly courseQueryRepository: CourseQueryRepository,
    private readonly placeQueryRepository: PlaceQueryRepository,
  ) {}

  async myCourseList(dto, user) {
    const courseList = await this.myCourseQueryRepository.find(dto, user);
    if (courseList.length === 0) {
      return ResponseDataDto.from([], null, 0);
    }

    const myCourseListResDto = plainToInstance(MyCourseListResDto, courseList, {
      excludeExtraneousValues: true,
    });

    const last_item_id = courseList.length > 0 ? courseList[courseList.length - 1].id : 0;

    return ResponseDataDto.from(myCourseListResDto, null, last_item_id);
  }

  async myCourseDetail(uuid) {
    const course = await this.myCourseQueryRepository.findOne(uuid);
    if (!course) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const coursePlaces = await this.courseQueryRepository.findPlace(course.course_uuid);

    const myCourseDetailResDto = new MyCourseDetailResDto({
      course_uuid: course.course_uuid,
      my_course_uuid: course.uuid,
      my_course_name: course.course_name,
      subway: course.subway,
      count: coursePlaces.length,
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

    return DetailResponseDto.from(myCourseDetailResDto);
  }

  async courseSave(user, uuid, dto) {
    const myCourseEntity = new MyCourseEntity();
    myCourseEntity.uuid = generateUUID();
    myCourseEntity.course_uuid = uuid;
    myCourseEntity.subway = dto.subway;
    myCourseEntity.line = dto.line;
    myCourseEntity.user_uuid = user.uuid;
    myCourseEntity.user_name = user.nickname;

    const myCourse = await this.courseQueryRepository.findOne(user, uuid);
    if (myCourse) {
      await this.courseQueryRepository.reSaveMyCourse(myCourse.id);
    } else {
      await this.courseQueryRepository.saveMyCourse(myCourseEntity);
    }
    return DetailResponseDto.uuid(uuid);
  }

  async courseDelete(user, uuid) {
    const myCourse = await this.courseQueryRepository.findOne(user, uuid);
    if (!myCourse) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    } else await this.courseQueryRepository.deleteMyCourse(myCourse.id);

    return DetailResponseDto.uuid(uuid);
  }
}
