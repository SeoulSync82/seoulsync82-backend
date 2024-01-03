import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { retry } from 'rxjs';
import { ERROR } from 'src/auth/constants/error';
import { DetailResponseDto, ResponseDataDto } from 'src/commons/dto/response.dto';
import { generateUUID } from 'src/commons/util/uuid';
import { ReactionQueryRepository } from 'src/community/reaction.query.repository';
import { CourseModule } from 'src/course/course.module';
import { CourseQueryRepository } from 'src/course/course.query.repository';
import { CoursePlaceDto, CourseRecommendResDto } from 'src/course/dto/course.dto';
import { BookmarkEntity } from 'src/entities/bookmark.entity';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { CourseSaveReqDto, MyCourseDetailResDto, MyCourseListResDto } from './dto/bookmark.dto';
import { BookmarkQueryRepository } from './bookmark.query.repository';
import { Emojis } from 'src/auth/constants/emoji';
import { UserQueryRepository } from 'src/user/user.query.repository';

@Injectable()
export class BookmarkService {
  constructor(
    private readonly BookmarkQueryRepository: BookmarkQueryRepository,
    private readonly courseQueryRepository: CourseQueryRepository,
    private readonly placeQueryRepository: PlaceQueryRepository,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  async myCourseList(dto, user) {
    const courseList = await this.BookmarkQueryRepository.find(dto, user);
    if (courseList.length === 0) {
      return ResponseDataDto.from([], null, 0);
    }

    const userList = await this.userQueryRepository.findUserList(
      courseList.map((item) => item.user_uuid),
    );

    const myCourseListResDto = plainToInstance(MyCourseListResDto, courseList, {
      excludeExtraneousValues: true,
    }).map((myCourse) => {
      myCourse.user_profile_image = userList.find(
        (user) => user.uuid === myCourse.user_uuid,
      ).profile_image;
      return myCourse;
    });

    const last_item_id = courseList.length === dto.size ? courseList[courseList.length - 1].id : 0;

    return { items: myCourseListResDto, last_item_id };
  }

  async myCourseDetail(uuid) {
    const course = await this.BookmarkQueryRepository.findOne(uuid);
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

    return myCourseDetailResDto;
  }

  async courseSave(user, uuid, dto: CourseSaveReqDto) {
    const course = await this.courseQueryRepository.findCourse(uuid);
    if (!course) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const BookmarkEntity = new BookmarkEntity();
    BookmarkEntity.uuid = generateUUID();
    BookmarkEntity.course_uuid = uuid;
    BookmarkEntity.subway = course.subway;
    BookmarkEntity.line = course.line;
    BookmarkEntity.course_name = course.course_name;
    BookmarkEntity.course_image = course.course_image;
    BookmarkEntity.user_uuid = user.uuid;
    BookmarkEntity.user_name = user.nickname;

    const myCourse = await this.courseQueryRepository.findOne(user, uuid);
    if (myCourse) {
      throw new ConflictException(ERROR.DUPLICATION);
    }
    await this.courseQueryRepository.saveMyCourse(BookmarkEntity);

    return DetailResponseDto.uuid(BookmarkEntity.uuid);
  }

  async courseDelete(user, uuid) {
    const myCourse = await this.courseQueryRepository.findOne(user, uuid);
    if (!myCourse) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    } else await this.courseQueryRepository.deleteMyCourse(myCourse.id);

    return DetailResponseDto.uuid(uuid);
  }
}
