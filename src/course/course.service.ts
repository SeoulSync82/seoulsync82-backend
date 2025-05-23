import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { blancLogger } from 'blanc-logger';
import { plainToInstance } from 'class-transformer';
import { BookmarkQueryRepository } from 'src/bookmark/bookmark.query.repository';
import { ERROR } from 'src/commons/constants/error';
import { LastItemIdResponseDto } from 'src/commons/dtos/last-item-id-response.dto';
import { PLACE_TYPE } from 'src/commons/enum/place-type-enum';
import { getCustomByPlaceType } from 'src/commons/helpers/custom-by-place-type.helper';
import { getPlaceTypeKey } from 'src/commons/helpers/place-type.helper';
import { isEmpty, isNotEmpty } from 'src/commons/util/is/is-empty';
import { CommunityQueryRepository } from 'src/community/community.query.repository';
import { CourseQueryRepository } from 'src/course/course.query.repository';
import { ApiCourseGetDetailResponseDto } from 'src/course/dto/api-course-get-detail-response.dto';
import { ApiCourseGetMyHistoryRequestQueryDto } from 'src/course/dto/api-course-get-my-history-request-query.dto';
import { ApiCourseGetMyHistoryResponseDto } from 'src/course/dto/api-course-get-my-history-response.dto';
import { ApiCourseGetPlaceListResponseDto } from 'src/course/dto/api-course-get-place-list-response.dto';
import { ApiCoursePostRecommendSaveRequestBodyDto } from 'src/course/dto/api-course-post-recommend-save-request-body.dto';
import { ApiCoursePostRecommendSaveResponseDto } from 'src/course/dto/api-course-post-recommend-save-response.dto';
import { ApiCoursePostSaveResponseDto } from 'src/course/dto/api-course-post-save-response.dto';
import { CoursePlaceDetailDto } from 'src/course/dto/course-place-detail.dto';
import { CoursePlaceInfoDto } from 'src/course/dto/course-place-info.dto';
import { CourseDetailEntity } from 'src/entities/course.detail.entity';
import { CourseEntity } from 'src/entities/course.entity';
import { SubwayQueryRepository } from 'src/subway/subway.query.repository';
import { ThemeQueryRepository } from 'src/theme/theme.query.repository';
import { UserDto } from 'src/user/dto/user.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { DataSource } from 'typeorm';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseQueryRepository: CourseQueryRepository,
    private readonly subwayQueryRepository: SubwayQueryRepository,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly bookmarkQueryRepository: BookmarkQueryRepository,
    private readonly communityQueryRepository: CommunityQueryRepository,
    private readonly themeQueryRepository: ThemeQueryRepository,
    private readonly dataSource: DataSource,
  ) {}

  async saveCourseRecommend(
    dto: ApiCoursePostRecommendSaveRequestBodyDto,
    user: UserDto,
  ): Promise<ApiCoursePostSaveResponseDto> {
    const course: CourseEntity = await this.courseQueryRepository.findCourse(dto.course_uuid);
    if (isNotEmpty(course)) {
      throw new ConflictException(ERROR.DUPLICATION);
    }

    const subwayWithLines = await this.subwayQueryRepository.findAllLinesForStation(
      dto.station_uuid,
    );
    if (isEmpty(subwayWithLines)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const theme = isNotEmpty(dto.theme_uuid)
      ? await this.themeQueryRepository.findThemeUuid(dto.theme_uuid)
      : null;

    /** 비회원일 경우 geust로 저장 */
    const { uuid: userUuid = null, nickname: userName = 'guest' } = user ?? {};

    const apiCoursePostRecommendSaveResponseDto = new ApiCoursePostRecommendSaveResponseDto({
      uuid: dto.course_uuid,
      subway: subwayWithLines[0].name,
      line: subwayWithLines.map((sub) => sub.line),
      theme: theme?.theme_name ?? null,
      course_name: dto.course_name,
      count: dto.places.length,
      place: dto.places,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const courseEntity = new CourseEntity();
      courseEntity.uuid = apiCoursePostRecommendSaveResponseDto.uuid;
      courseEntity.line = apiCoursePostRecommendSaveResponseDto.line.join(', ');
      courseEntity.subway = subwayWithLines[0].name;
      courseEntity.course_name = dto.course_name;
      courseEntity.user_uuid = userUuid;
      courseEntity.user_name = userName;
      courseEntity.count = dto.places.length;
      courseEntity.theme = theme?.theme_name ?? null;
      courseEntity.customs = dto.places.map((place) => PLACE_TYPE[place.place_type]).join(', ');

      await queryRunner.manager.save(CourseEntity, courseEntity);

      const courseDetailEntity = apiCoursePostRecommendSaveResponseDto.place.map((place) => {
        const courseDetail = new CourseDetailEntity();
        courseDetail.course_uuid = apiCoursePostRecommendSaveResponseDto.uuid;
        courseDetail.sort = place.sort;
        courseDetail.place_uuid = place.uuid;
        courseDetail.place_name = place.place_name;
        courseDetail.place_type = PLACE_TYPE[place.place_type];
        return courseDetail;
      });

      await queryRunner.manager.save(CourseDetailEntity, courseDetailEntity);
      await queryRunner.commitTransaction();
      return { uuid: apiCoursePostRecommendSaveResponseDto.uuid };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      blancLogger.error('Error in saveCourseRecommend', { moduleName: 'CourseService' });
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async getCourseDetail(uuid: string, user: UserDto): Promise<ApiCourseGetDetailResponseDto> {
    const userInfo = isEmpty(user)
      ? { uuid: '', id: null, nickname: null, profile_image: null }
      : user;

    /** Promise.all()로 병렬 처리 */
    const [course, bookmark, community, coursePlaces] = await Promise.all([
      this.courseQueryRepository.findOne(uuid),
      this.bookmarkQueryRepository.findUserBookmark(userInfo, uuid),
      this.communityQueryRepository.findCommunityByCourse(uuid, userInfo),
      this.courseQueryRepository.findPlace(uuid),
    ]);

    if (isEmpty(course)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const subwayStation = await this.subwayQueryRepository.findSubwayStationName(course.subway);
    const subway = await this.subwayQueryRepository.findSubway(subwayStation.name);

    const theme = isNotEmpty(course.theme)
      ? await this.themeQueryRepository.findThemeName(course.theme)
      : null;

    const placeDtos = coursePlaces.map((place) => {
      return plainToInstance(
        CoursePlaceInfoDto,
        {
          ...place.place,
          sort: place.sort,
          uuid: place.place_uuid,
          place_type: getPlaceTypeKey(place.place_type),
          place_detail: getCustomByPlaceType(place.place, place.place_type),
        },
        { excludeExtraneousValues: true },
      );
    });

    return new ApiCourseGetDetailResponseDto({
      course_uuid: uuid,
      course_name: course.course_name,
      subway: {
        uuid: subwayStation.uuid,
        station: subwayStation.name,
      },
      line: subway.map((subwayLine) => ({
        uuid: subwayLine.line_uuid,
        line: subwayLine.line,
      })),
      theme: theme
        ? {
            uuid: theme.uuid,
            theme: theme.theme_name,
          }
        : undefined,
      customs: course.customs,
      is_bookmarked: isNotEmpty(bookmark),
      is_posted: isNotEmpty(community),
      created_at: course.created_at,
      places: placeDtos,
    });
  }

  async getMyCourseHistory(
    dto: ApiCourseGetMyHistoryRequestQueryDto,
    user: UserDto,
  ): Promise<LastItemIdResponseDto<ApiCourseGetMyHistoryResponseDto>> {
    const courseList: CourseEntity[] = await this.courseQueryRepository.findMyCourse(dto, user);
    if (courseList.length === 0) {
      return { items: [], last_item_id: 0 };
    }

    const [userList, postedCourses = []] = await Promise.all([
      this.userQueryRepository.findUserList(courseList.map((item) => item.user_uuid)),
      this.communityQueryRepository.findExistingCourse(courseList.map((item) => item.uuid)),
    ]);

    const lastItemId = courseList.length === dto.size ? courseList[courseList.length - 1].id : 0;

    return {
      items: plainToInstance(ApiCourseGetMyHistoryResponseDto, courseList, {
        excludeExtraneousValues: true,
      }).map((myHistory) => {
        const communityMeta = postedCourses.find((c) => c.course_uuid === myHistory.course_uuid);
        return {
          ...myHistory,
          user_profile_image:
            userList.find((u) => u.uuid === myHistory.user_uuid)?.profile_image ?? null,
          is_posted: !!communityMeta,
          community_uuid: communityMeta?.community_uuid ?? null,
          score: communityMeta?.score ?? '0.0',
          like_count: communityMeta?.like_count ?? 0,
        };
      }),
      last_item_id: lastItemId,
    };
  }

  async getCoursePlaceList(uuid): Promise<ApiCourseGetPlaceListResponseDto> {
    const course = await this.courseQueryRepository.findOne(uuid);
    if (!course) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const coursePlaces = await this.courseQueryRepository.findPlace(uuid);

    return new ApiCourseGetPlaceListResponseDto({
      course_uuid: uuid,
      course_name: course.course_name,
      place: plainToInstance(
        CoursePlaceDetailDto,
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
  }
}
