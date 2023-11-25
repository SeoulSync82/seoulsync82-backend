import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { retry } from 'rxjs';
import { ERROR } from 'src/auth/constants/error';
import { DetailResponseDto, ResponseDataDto } from 'src/commons/dto/response.dto';
import { CourseModule } from 'src/course/course.module';
import { CourseQueryRepository } from 'src/course/course.query.repository';
import { CoursePlaceDto, CourseRecommendResDto } from 'src/course/dto/course.dto';
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

    const myCourseDetailResDto = new CourseRecommendResDto({
      uuid: course.uuid,
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
}
