import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BookmarkQueryRepository } from 'src/bookmark/bookmark.query.repository';
import { ERROR } from 'src/commons/constants/error';
import { PLACE_TYPE } from 'src/commons/enum/place-type-enum';
import { getCustomByPlaceType } from 'src/commons/helpers/custom-by-place-type.helper';
import { isEmpty, isNotEmpty } from 'src/commons/util/is/is-empty';
import { CommunityQueryRepository } from 'src/community/community.query.repository';
import { CourseDetailEntity } from 'src/entities/course.detail.entity';
import { CourseEntity } from 'src/entities/course.entity';
import { SubwayQueryRepository } from 'src/subway/subway.query.repository';
import { ThemeQueryRepository } from 'src/theme/theme.query.repository';
import { UserDto } from 'src/user/dto/user.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { DataSource } from 'typeorm';
import { LastItemIdResponseDto } from '../commons/dtos/last-item-id-response.dto';
import { getPlaceTypeKey } from '../commons/helpers/place-type.helper';
import { CourseQueryRepository } from './course.query.repository';
import { ApiCourseGetDetailResponseDto } from './dto/api-course-get-detail-response.dto';
import { ApiCourseGetMyHistoryRequestQueryDto } from './dto/api-course-get-my-history-request-query.dto';
import { ApiCourseGetMyHistoryResponseDto } from './dto/api-course-get-my-history-response.dto';
import { ApiCourseGetPlaceListResponseDto } from './dto/api-course-get-place-list-response.dto';
import { PlaceDetailDto } from './dto/api-course-get-recommend-response.dto';
import { ApiCoursePostRecommendSaveRequestBodyDto } from './dto/api-course-post-recommend-save-request-body.dto';
import { ApiCoursePostRecommendSaveResponseDto } from './dto/api-course-post-recommend-save-response.dto';
import { ApiCoursePostSaveResponseDto } from './dto/api-course-post-save-response.dto';
import { CoursePlaceDetailDto } from './dto/course.dto';

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

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

    let theme;
    if (isNotEmpty(dto.theme_uuid)) {
      theme = await this.themeQueryRepository.findThemeUuid(dto.theme_uuid);
    }

    /** 비회원일 경우 geust로 저장 */
    const userUuid = user?.uuid || null;
    const userName = user?.nickname || 'guest';

    const apiCoursePostRecommendSaveResponseDto = new ApiCoursePostRecommendSaveResponseDto({
      uuid: dto.course_uuid,
      subway: subwayWithLines[0].name,
      line: subwayWithLines.map((sub) => sub.line),
      theme: theme.theme_name,
      course_name: dto.course_name,
      count: dto.places.length,
      place: dto.places,
    });

    // 트랜잭션 처리
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
      courseEntity.theme = theme.theme_name;
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
      this.logger.error('Error in saveCourseRecommend', e.stack);
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async getCourseDetail(uuid: string, user: UserDto): Promise<ApiCourseGetDetailResponseDto> {
    if (isEmpty(user)) {
      user = { uuid: '', id: null, nickname: null, profile_image: null };
    }

    /** Promise.all()로 병렬 처리 */
    const [course, bookmark, community, coursePlaces] = await Promise.all([
      this.courseQueryRepository.findOne(uuid),
      this.bookmarkQueryRepository.findUserBookmark(user, uuid),
      this.communityQueryRepository.findCommunityByCourse(uuid, user),
      this.courseQueryRepository.findPlace(uuid),
    ]);

    if (isEmpty(course)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const subwayStation = await this.subwayQueryRepository.findSubwayStationName(course.subway);
    const subway = await this.subwayQueryRepository.findSubway(subwayStation.name);

    let theme;
    if (isNotEmpty(course.theme)) {
      theme = await this.themeQueryRepository.findThemeName(course.theme);
    }

    const placeDtos = coursePlaces.map((place) => {
      return plainToInstance(
        PlaceDetailDto,
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

    const apiCourseDetailGetResponseDto = new ApiCourseGetDetailResponseDto({
      course_uuid: uuid,
      course_name: course.course_name,
      subway: {
        uuid: subwayStation.uuid,
        station: subwayStation.name,
      },
      line: subway.map((subwayLine) => ({
        uuid: subwayLine.uuid,
        line: subwayLine.line,
      })),
      theme: theme
        ? {
            uuid: theme.uuid,
            theme: theme.theme_name,
          }
        : undefined,
      is_bookmarked: isNotEmpty(bookmark),
      is_posted: isNotEmpty(community),
      created_at: course.created_at,
      places: placeDtos,
    });

    return apiCourseDetailGetResponseDto;
  }

  async getMyCourseHistory(
    dto: ApiCourseGetMyHistoryRequestQueryDto,
    user: UserDto,
  ): Promise<LastItemIdResponseDto<ApiCourseGetMyHistoryResponseDto>> {
    const courseList = await this.courseQueryRepository.findMyCourse(dto, user);
    if (courseList.length === 0) {
      return { items: [], last_item_id: 0 };
    }

    const userList = await this.userQueryRepository.findUserList(
      courseList.map((item) => item.user_uuid),
    );

    const apiCourseMyHistoryGetResponseDto = plainToInstance(
      ApiCourseGetMyHistoryResponseDto,
      courseList,
      {
        excludeExtraneousValues: true,
      },
    ).map((myHistory) => {
      myHistory.user_profile_image = userList.find(
        (user) => user.uuid === myHistory.user_uuid,
      ).profile_image;
      return myHistory;
    });

    const last_item_id = courseList.length === dto.size ? courseList[courseList.length - 1].id : 0;

    return { items: apiCourseMyHistoryGetResponseDto, last_item_id };
  }

  async getCoursePlaceList(uuid): Promise<ApiCourseGetPlaceListResponseDto> {
    const course = await this.courseQueryRepository.findOne(uuid);
    if (!course) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const coursePlaces = await this.courseQueryRepository.findPlace(uuid);

    const apiCoursePlaceListGetResponseDto = new ApiCourseGetPlaceListResponseDto({
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

    return apiCoursePlaceListGetResponseDto;
  }
}
