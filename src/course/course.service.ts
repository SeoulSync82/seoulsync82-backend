import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/auth/constants/error';
import { BookmarkQueryRepository } from 'src/bookmark/bookmark.query.repository';
import { DetailResponseDto } from 'src/commons/dto/response.dto';
import { Emojis } from 'src/commons/enum/emoji';
import { PLACE_TYPE } from 'src/commons/enum/place-type-enum';
import { customPlaceDetailFunction } from 'src/commons/function/get-place-detail-function';
import { isEmpty, isNotEmpty } from 'src/commons/util/is/is-empty';
import { generateUUID } from 'src/commons/util/uuid';
import { CommunityQueryRepository } from 'src/community/community.query.repository';
import { ReactionQueryRepository } from 'src/community/reaction.query.repository';
import { BookmarkEntity } from 'src/entities/bookmark.entity';
import { CommunityEntity } from 'src/entities/community.entity';
import { CourseDetailEntity } from 'src/entities/course.detail.entity';
import { CourseEntity } from 'src/entities/course.entity';
import { PlaceEntity } from 'src/entities/place.entity';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { SubwayQueryRepository } from 'src/subway/subway.query.repository';
import { ThemeQueryRepository } from 'src/theme/theme.query.repository';
import { UserDto } from 'src/user/dto/user.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { CourseQueryRepository } from './course.query.repository';
import { ApiCourseGetDetailResponseDto } from './dto/api-course-get-detail-response.dto';
import { ApiCourseGetMyHistoryRequestQueryDto } from './dto/api-course-get-my-history-request-query.dto';
import { ApiCourseGetMyHistoryResponseDto } from './dto/api-course-get-my-history-response.dto';
import { ApiCourseGetPlaceCustomizeRequestQueryDto } from './dto/api-course-get-place-customize-request-query.dto';
import { ApiCourseGetPlaceCustomizeResponseDto } from './dto/api-course-get-place-customize-response.dto';
import { ApiCourseGetPlaceListResponseDto } from './dto/api-course-get-place-list-response.dto';
import { ApiCourseGetRecommendRequestQueryDto } from './dto/api-course-get-recommend-request-query.dto';
import {
  ApiCourseGetRecommendResponseDto,
  PlaceDetailDto,
} from './dto/api-course-get-recommend-response.dto';
import { ApiCoursePostRecommendRequestBodyDto } from './dto/api-course-post-recommend-request-body.dto';
import { ApiCoursePostRecommendResponseDto } from './dto/api-course-post-recommend-response.dto';
import { ApiCoursePostRecommendSaveRequestBodyDto } from './dto/api-course-post-recommend-save-request-body.dto';
import { ApiCoursePostRecommendSaveResponseDto } from './dto/api-course-post-recommend-save-response.dto';
import { CoursePlaceDetailDto, CoursePlaceDto } from './dto/course.dto';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseQueryRepository: CourseQueryRepository,
    private readonly subwayQueryRepository: SubwayQueryRepository,
    private readonly placeQueryRepository: PlaceQueryRepository,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly bookmarkQueryRepository: BookmarkQueryRepository,
    private readonly communityQueryRepository: CommunityQueryRepository,
    private readonly reactionQueryRepository: ReactionQueryRepository,
    private readonly themeQueryRepository: ThemeQueryRepository,
  ) {}

  async courseRecommend(dto: ApiCourseGetRecommendRequestQueryDto, user?: UserDto) {
    const subwayStation = await this.subwayQueryRepository.findSubwayStationUuid(dto.station_uuid);
    if (isEmpty(subwayStation)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    let theme;

    if (isNotEmpty(dto.theme_uuid)) {
      theme = await this.themeQueryRepository.findThemeUuid(dto.theme_uuid);
      // customs = customs.filter((item) => item !== '음식점');
      // 추후 subway , place_theme , place 세개 테이블 Join
    }

    let userHistoryCourse: CourseDetailEntity[];
    if (isNotEmpty(user)) {
      userHistoryCourse = await this.courseQueryRepository.findUserHistoryCourse(user.uuid);
    }

    const subwayPlaceList: PlaceEntity[] = await this.placeQueryRepository.findSubwayPlaceList(
      dto,
      subwayStation.name,
    );

    let defaultCustoms = ['음식점', '카페', '술집'];
    let placeNonSorting = [];

    for (const custom of defaultCustoms) {
      const customPlace: PlaceEntity[] = subwayPlaceList.filter(
        (item) => item.place_type === custom,
      );

      function calculateWeight(customPlace) {
        let weight = customPlace.score * Math.log(customPlace.review_count + 1);
        if (isNotEmpty(userHistoryCourse)) {
          if (userHistoryCourse.map((item) => item.place_uuid).includes(customPlace.uuid)) {
            /** 최근 7일내에 추천된 장소면 가중치 감소 */
            weight = weight / 2;
          }
        }
        return weight;
      }

      function getTopWeight(customPlace, topN) {
        const weightedPlace = customPlace.map((item) => ({
          ...item,
          weight: calculateWeight(item),
        }));

        return weightedPlace.sort((a, b) => b.weight - a.weight).slice(0, topN);
      }
      /** 가중치 평균 방식으로 측정해 상위 N개 추출 */
      const topWeightPlaces = getTopWeight(customPlace, 10);

      function getRandomElements(topWeightPlaces, n) {
        const placeListArray = [...topWeightPlaces];
        const result = [];

        for (let i = 0; i < n && placeListArray.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * placeListArray.length);
          result.push(placeListArray[randomIndex]);
          /** 선택된 장소 제거: 같은 커스텀 여러개 골랐을 case 중복 장소 안나오게 */
          placeListArray.splice(randomIndex, 1);
        }
        return result;
      }
      /** 상위 N개중 랜덤한 값 추출 */
      const randomplaces = getRandomElements(topWeightPlaces, 1);
      placeNonSorting.push(...randomplaces);
    }

    const placeSorting: PlaceDetailDto[] = [];
    for (const [index, place_type] of defaultCustoms.entries()) {
      let customSortingPlace = placeNonSorting.find((item) => item.place_type === place_type);

      placeNonSorting = placeNonSorting.filter((item) => item !== customSortingPlace);

      if (isEmpty(customSortingPlace)) {
        /** AI 코스 추천시 결과 장소 하나라도 없으면 Error 처리 */
        throw new NotFoundException(ERROR.NOT_EXIST_DATA);
      }

      const placeDetailDto = plainToInstance(PlaceDetailDto, customSortingPlace, {
        excludeExtraneousValues: true,
      });
      placeDetailDto.sort = index + 1;
      placeDetailDto.place_type = Object.entries(PLACE_TYPE).find(
        ([, val]) => val === placeDetailDto.place_type,
      )[0];
      placeDetailDto.place_detail = customPlaceDetailFunction(customSortingPlace, place_type);
      placeSorting.push(placeDetailDto);
    }

    let course_name: string;

    if (isEmpty(dto.theme_uuid)) {
      const randomEmoji = Emojis[Math.floor(Math.random() * Emojis.length)];
      course_name = `${subwayStation.name}역, 주변 코스 일정 ${randomEmoji}`;
    } else {
      const themeText = theme.theme_name.substring(0, theme.theme_name.length - 2).trim();
      const themeEmoji = theme.theme_name.substring(theme.theme_name.length - 2);
      course_name = `${subwayStation.name}역, ${themeText} 코스 일정 ${themeEmoji}`;
    }

    const subway = await this.subwayQueryRepository.findSubway(subwayStation.name);

    const apiCourseGetRecommendResponseDto = new ApiCourseGetRecommendResponseDto({
      course_uuid: generateUUID(),
      course_name: course_name,
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
      places: placeSorting,
    });

    return { items: apiCourseGetRecommendResponseDto };
  }

  async old_courseMemberRecommend(user: UserDto, dto: ApiCoursePostRecommendRequestBodyDto) {
    let customs: string[] = dto.customs;

    const countCustoms = dto.customs.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    let placeNonSorting = [];

    if (dto.theme) {
      // customs = customs.filter((item) => item !== '음식점');
      // 추후 subway , place_theme , place 세개 테이블 Join
    }

    const userHistoryCourse: CourseDetailEntity[] =
      await this.courseQueryRepository.findUserHistoryCourse(user.uuid);

    if (dto.customs.includes('문화')) {
      const subwayCultureList: PlaceEntity[] =
        await this.placeQueryRepository.findSubwayCultureList(dto);

      function calculateWeight(customPlace) {
        let weight = 10; // 문화는 리뷰, 평점 없어서 가중치 고정값
        if (userHistoryCourse.map((item) => item.place_uuid).includes(customPlace.uuid)) {
          weight = weight / 2; // 최근 7일내에 추천된 장소면 가중치 감소
        }
        return weight;
      }
      /** 가중치 평균 방식으로 측정해 상위 N개 추출 */
      function getTopWeight(subwayCultureList, topN) {
        const weightedPlace = subwayCultureList.map((item) => ({
          ...item,
          weight: calculateWeight(item),
        }));

        return weightedPlace.sort((a, b) => b.weight - a.weight).slice(0, topN);
      }

      const topWeightPlaces = getTopWeight(subwayCultureList, 10);

      function getRandomElements(topWeightPlaces, n) {
        let tempArray = [...topWeightPlaces];
        const result = [];

        for (let i = 0; i < n && tempArray.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * tempArray.length);
          result.push(tempArray[randomIndex]);
          tempArray.splice(randomIndex, 1);
          /** 선택된 장소 제거: 같은 커스텀 여러개 골랐을 case 중복 장소 안나오게 */
        }
        return result;
      }
      // 문화는 리뷰,평점 없어서 히스토리 가중치 감소만 반영 N개
      const ramdomCultures = getRandomElements(subwayCultureList, countCustoms['문화']);
      placeNonSorting.push(...ramdomCultures);

      customs = customs.filter((item) => item !== '문화');
    }

    if (customs.length !== 0) {
      const subwayPlaceList: PlaceEntity[] =
        await this.placeQueryRepository.old_findSubwayPlaceList(customs, dto);

      for (const custom in countCustoms) {
        if (custom !== '문화') {
          const customPlace = subwayPlaceList.filter((item) => item.place_type === custom);

          function calculateWeight(customPlace) {
            let weight = customPlace.score * Math.log(customPlace.review_count + 1);
            if (userHistoryCourse.map((item) => item.place_uuid).includes(customPlace.uuid)) {
              weight = weight / 2; // 최근 7일내에 추천된 장소면 가중치 감소
            }
            return weight;
          }

          function getTopWeight(customPlace, topN) {
            const weightedPlace = customPlace.map((item) => ({
              ...item,
              weight: calculateWeight(item),
            }));

            return weightedPlace.sort((a, b) => b.weight - a.weight).slice(0, topN);
          }

          const topWeightPlaces = getTopWeight(customPlace, 10);
          /** 가중치 평균 방식으로 측정해 상위 N개 추출 */

          function getRandomElements(topWeightPlaces, n) {
            const tempArray = [...topWeightPlaces];
            const result = [];

            for (let i = 0; i < n && tempArray.length > 0; i++) {
              const randomIndex = Math.floor(Math.random() * tempArray.length);
              result.push(tempArray[randomIndex]);
              tempArray.splice(randomIndex, 1);
              /** 선택된 장소 제거: 같은 커스텀 여러개 골랐을 case 중복 장소 안나오게 */
            }
            return result;
          }

          const randomplaces = getRandomElements(topWeightPlaces, countCustoms[custom]);
          /** 상위 N개중 랜덤한 값 추출 */
          placeNonSorting.push(...randomplaces);
        }
      }
    }
    const placeSorting: CoursePlaceDto[] = [];

    for (const [index, place_type] of dto.customs.entries()) {
      let customSortingPlace;
      if (place_type === '문화') {
        customSortingPlace = placeNonSorting.filter(
          (item) => item.place_type === '전시' || item.place_type === '팝업',
        );
      } else {
        customSortingPlace = placeNonSorting.filter((item) => item.place_type === place_type);
      }
      placeNonSorting = placeNonSorting.filter((item) => item !== customSortingPlace[0]);

      if (!customSortingPlace[0]) {
        /** AI 코스 추천시 결과 장소 하나라도 없으면 Error 처리 */
        throw new NotFoundException(
          `${dto.subway}역에는 '${place_type}'에 해당하는 핫플레이스가 부족해요...`,
        );
      }
      const coursePlaceDto: CoursePlaceDto = plainToInstance(
        CoursePlaceDto,
        customSortingPlace[0],
        {
          excludeExtraneousValues: true,
        },
      );
      coursePlaceDto.sort = index + 1;
      placeSorting.push(coursePlaceDto);
    }

    const themes = [];
    let course_name: string;

    if (dto.theme) themes.push(dto.theme);

    if (themes.length === 0) {
      const randomEmoji = Emojis[Math.floor(Math.random() * Emojis.length)];
      course_name = `${dto.subway}역 주변 코스 일정 ${randomEmoji}`;
    } else {
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];

      const themeText = randomTheme.substring(0, randomTheme.length - 2).trim();
      const themeEmoji = randomTheme.substring(randomTheme.length - 2);
      course_name = `${dto.subway}역 ${themeText} 코스 일정 ${themeEmoji}`;
    }

    const subway = await this.subwayQueryRepository.findSubway(dto.subway);

    const apiCourseRecommendPostResponseDto = new ApiCoursePostRecommendResponseDto({
      uuid: generateUUID(),
      subway: dto.subway,
      line: subway.map((item) => item.line),
      theme: dto.theme,
      course_name: course_name,
      count: dto.customs?.length ?? 0,
      place: placeSorting,
    });

    const courseEntity = new CourseEntity();
    courseEntity.uuid = apiCourseRecommendPostResponseDto.uuid;
    courseEntity.line = dto.line;
    courseEntity.subway = dto.subway;
    courseEntity.course_name = course_name;
    courseEntity.user_uuid = user.uuid;
    courseEntity.user_name = user.nickname;
    courseEntity.count = apiCourseRecommendPostResponseDto.count;
    courseEntity.customs = dto.customs.join(', ');

    await this.courseQueryRepository.saveCourse(courseEntity);

    const courseDetailEntity = apiCourseRecommendPostResponseDto.place.map((place) => {
      const courseDetail = new CourseDetailEntity();
      courseDetail.course_uuid = apiCourseRecommendPostResponseDto.uuid;
      courseDetail.sort = place.sort;
      courseDetail.place_uuid = place.uuid;
      courseDetail.place_name = place.place_name;
      courseDetail.place_type = place.place_type;
      return courseDetail;
    });

    await this.courseQueryRepository.saveCourseDetail(courseDetailEntity);

    return apiCourseRecommendPostResponseDto;
  }

  async old_courseGuestRecommend(dto: ApiCoursePostRecommendRequestBodyDto) {
    let customs: string[] = dto.customs;

    const countCustoms = dto.customs.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    let placeNonSorting = [];

    if (dto.theme) {
      // customs = customs.filter((item) => item !== '음식점');
      // 추후 subway , place_theme , place 세개 테이블 Join
    }

    if (dto.customs.includes('문화')) {
      const subwayCultureList: PlaceEntity[] =
        await this.placeQueryRepository.findSubwayCultureList(dto);

      function getRandomElements(topWeightPlaces, n) {
        const tempArray = [...topWeightPlaces];
        const result = [];

        for (let i = 0; i < n && tempArray.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * tempArray.length);
          result.push(tempArray[randomIndex]);
          tempArray.splice(randomIndex, 1);
        }
        return result;
      }
      // 문화는 리뷰,평점 없어서 그냥 랜덤 N개
      const ramdomCultures = getRandomElements(subwayCultureList, countCustoms['문화']);
      placeNonSorting.push(...ramdomCultures);

      customs = customs.filter((item) => item !== '문화');
    }

    const subwayPlaceList: PlaceEntity[] = await this.placeQueryRepository.old_findSubwayPlaceList(
      customs,
      dto,
    );

    for (const custom in countCustoms) {
      if (custom !== '문화') {
        const customPlace = subwayPlaceList.filter((item) => item.place_type === custom);
        function calculateWeight(customPlace) {
          return customPlace.score * Math.log(customPlace.review_count + 1);
        }

        function getTopWeight(customPlace, topN) {
          const weightedPlace = customPlace.map((item) => ({
            ...item,
            weight: calculateWeight(item),
          }));

          return weightedPlace.sort((a, b) => b.weight - a.weight).slice(0, topN);
        }

        const topWeightPlaces = getTopWeight(customPlace, 10);
        /** 가중치 평균 방식으로 측정해 상위 N개 추출 */

        function getRandomElements(topWeightPlaces, n) {
          const tempArray = [...topWeightPlaces];
          const result = [];

          for (let i = 0; i < n && tempArray.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * tempArray.length);
            result.push(tempArray[randomIndex]);
            tempArray.splice(randomIndex, 1);
            /** 선택된 장소 제거: 같은 커스텀 여러개 골랐을 case 중복 장소 안나오게 */
          }
          return result;
        }

        const randomplaces = getRandomElements(topWeightPlaces, countCustoms[custom]);
        // 상위 N개중 랜덤한 값 추출
        placeNonSorting.push(...randomplaces);
      }
    }
    const placeSorting: CoursePlaceDto[] = [];

    for (const [index, place_type] of dto.customs.entries()) {
      let customSortingPlace;
      if (place_type === '문화') {
        customSortingPlace = placeNonSorting.filter(
          (item) => item.place_type === '전시' || item.place_type === '팝업',
        );
      } else {
        customSortingPlace = placeNonSorting.filter((item) => item.place_type === place_type);
      }
      placeNonSorting = placeNonSorting.filter((item) => item !== customSortingPlace[0]);

      if (!customSortingPlace[0]) {
        /** AI 코스 추천시 결과 장소 하나라도 없으면 Error 처리 */
        throw new NotFoundException(
          `${dto.subway}역에는 '${place_type}'에 해당하는 핫플레이스가 부족해요...`,
        );
      }
      const coursePlaceDto: CoursePlaceDto = plainToInstance(
        CoursePlaceDto,
        customSortingPlace[0],
        {
          excludeExtraneousValues: true,
        },
      );
      coursePlaceDto.sort = index + 1;
      placeSorting.push(coursePlaceDto);
    }

    const themes = [];
    let course_name: string;

    if (dto.theme) themes.push(dto.theme);

    if (themes.length === 0) {
      const randomEmoji = Emojis[Math.floor(Math.random() * Emojis.length)];
      course_name = `${dto.subway}역 주변 코스 일정 ${randomEmoji}`;
    } else {
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];

      const themeText = randomTheme.substring(0, randomTheme.length - 2).trim();
      const themeEmoji = randomTheme.substring(randomTheme.length - 2);
      course_name = `${dto.subway}역 ${themeText} 코스 일정 ${themeEmoji}`;
    }

    const subway = await this.subwayQueryRepository.findSubway(dto.subway);

    const apiCourseRecommendPostResponseDto = new ApiCoursePostRecommendResponseDto({
      uuid: generateUUID(),
      subway: dto.subway,
      line: subway.map((item) => item.line),
      theme: dto.theme,
      course_name: course_name,
      count: dto.customs?.length ?? 0,
      place: placeSorting,
    });

    return DetailResponseDto.from(apiCourseRecommendPostResponseDto);
  }

  async myCourseRecommandHistory(dto: ApiCourseGetMyHistoryRequestQueryDto, user: UserDto) {
    const courseList = await this.courseQueryRepository.findMyCourse(dto, user);
    if (courseList.length === 0) {
      return { items: [] };
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

  async courseRecommendSave(dto: ApiCoursePostRecommendSaveRequestBodyDto, user: UserDto) {
    const subwayStation = await this.subwayQueryRepository.findSubwayStationUuid(dto.subway.uuid);
    if (isEmpty(subwayStation)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const subway = await this.subwayQueryRepository.findSubway(subwayStation.name);

    let theme;

    if (isNotEmpty(dto.theme.uuid)) {
      theme = await this.themeQueryRepository.findThemeUuid(dto.theme.uuid);
    }

    const userUuid = user?.uuid || null; // 회원이 아닐 경우 null로 설정
    const userName = user?.nickname || 'guest'; // 닉네임 없으면 'guest'으로 설정

    const apiCoursePostRecommendSaveResponseDto = new ApiCoursePostRecommendSaveResponseDto({
      uuid: dto.course_uuid,
      subway: subwayStation.name,
      line: subway.map((sub) => sub.line),
      theme: theme.theme_name,
      course_name: dto.course_name,
      count: dto.places.length,
      place: dto.places,
    });

    const courseEntity = new CourseEntity();
    courseEntity.uuid = apiCoursePostRecommendSaveResponseDto.uuid;
    courseEntity.line = apiCoursePostRecommendSaveResponseDto.line.join(', ');
    courseEntity.subway = subwayStation.name;
    courseEntity.course_name = dto.course_name;
    courseEntity.user_uuid = userUuid;
    courseEntity.user_name = userName;
    courseEntity.count = dto.places.length;
    courseEntity.theme = theme.theme_name;
    courseEntity.customs = dto.places.map((place) => PLACE_TYPE[place.place_type]).join(', ');

    await this.courseQueryRepository.saveCourse(courseEntity);

    const courseDetailEntity = apiCoursePostRecommendSaveResponseDto.place.map((place) => {
      const courseDetail = new CourseDetailEntity();
      courseDetail.course_uuid = apiCoursePostRecommendSaveResponseDto.uuid;
      courseDetail.sort = place.sort;
      courseDetail.place_uuid = place.uuid;
      courseDetail.place_name = place.place_name;
      courseDetail.place_type = PLACE_TYPE[place.place_type];
      return courseDetail;
    });

    await this.courseQueryRepository.saveCourseDetail(courseDetailEntity);
    return { items: apiCoursePostRecommendSaveResponseDto.uuid };
  }

  async courseDetail(uuid, user: UserDto) {
    const course = await this.courseQueryRepository.findOne(uuid);
    if (isEmpty(course)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    if (isEmpty(user)) {
      user = { uuid: '', id: null, nickname: null, profile_image: null };
    }

    const bookmark: BookmarkEntity = await this.bookmarkQueryRepository.findUserBookmark(
      user,
      uuid,
    );
    const community: CommunityEntity = await this.communityQueryRepository.findCommunityByCourse(
      uuid,
      user,
    );
    const coursePlaces = await this.courseQueryRepository.findPlace(uuid);

    const subwayStation = await this.subwayQueryRepository.findSubwayStationName(course.subway);
    const subway = await this.subwayQueryRepository.findSubway(subwayStation.name);

    let theme;
    if (isNotEmpty(course.theme)) {
      theme = await this.themeQueryRepository.findThemeName(course.theme);
    }

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
      places: plainToInstance(
        PlaceDetailDto,
        coursePlaces.map((place) => ({
          ...place.place,
          sort: place.sort,
          uuid: place.place_uuid,
          place_type: Object.entries(PLACE_TYPE).find(([, val]) => val === place.place_type)[0],
          place_detail: customPlaceDetailFunction(place.place, place.place_type),
        })),
        {
          excludeExtraneousValues: true,
        },
      ),
    });

    return { items: apiCourseDetailGetResponseDto };
  }

  async coursePlaceList(uuid) {
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

  async coursePlaceCustomize(dto: ApiCourseGetPlaceCustomizeRequestQueryDto, user?: UserDto) {
    const subwayStation = await this.subwayQueryRepository.findSubwayStationUuid(dto.station_uuid);
    if (isEmpty(subwayStation)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    let userHistoryCourse: CourseDetailEntity[];
    if (isNotEmpty(user)) {
      userHistoryCourse = await this.courseQueryRepository.findUserHistoryCourse(user.uuid);
    }

    let subwayPlaceCustomizeList: PlaceEntity[];
    if (dto.place_type === 'CULTURE') {
      subwayPlaceCustomizeList =
        await this.placeQueryRepository.findSubwayPlaceCustomizeCultureList(subwayStation.name);
    } else {
      subwayPlaceCustomizeList = await this.placeQueryRepository.findSubwayPlaceCustomizeList(
        dto,
        subwayStation.name,
      );
    }

    const placeUuidsSet = new Set(dto.place_uuids);
    const filteredPlaceList = subwayPlaceCustomizeList.filter(
      (place) => !placeUuidsSet.has(place.uuid),
    );

    function calculateWeight(customPlace) {
      let weight = customPlace.score * Math.log(customPlace.review_count + 1);
      if (isNotEmpty(userHistoryCourse)) {
        if (userHistoryCourse.map((item) => item.place_uuid).includes(customPlace.uuid)) {
          weight = weight / 2; // 최근 7일내에 추천된 장소면 가중치 감소
        }
      }
      return weight;
    }

    function getTopWeight(customPlace, topN) {
      const weightedPlace = customPlace.map((item) => ({
        ...item,
        weight: calculateWeight(item),
      }));

      return weightedPlace.sort((a, b) => b.weight - a.weight).slice(0, topN);
    }
    /** 가중치 평균 방식으로 측정해 상위 N개 추출 */
    const topWeightPlaces = getTopWeight(filteredPlaceList, 10);

    function getRandomElements(topWeightPlaces, n) {
      const placeListArray = [...topWeightPlaces];
      const result = [];

      for (let i = 0; i < n && placeListArray.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * placeListArray.length);
        result.push(placeListArray[randomIndex]);
        /** 선택된 장소 제거: 같은 커스텀 여러개 골랐을 case 중복 장소 안나오게 */
        placeListArray.splice(randomIndex, 1);
      }
      return result;
    }
    /** 상위 N개중 랜덤한 값 추출 */
    const selectedplace = getRandomElements(topWeightPlaces, 1);

    if (isEmpty(selectedplace)) {
      /** AI 코스 추천시 결과 장소 하나라도 없으면 Error 처리 */
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }
    const apiCourseGetPlaceCustomizeResponseDto = plainToInstance(
      ApiCourseGetPlaceCustomizeResponseDto,
      selectedplace[0],
      {
        excludeExtraneousValues: true,
      },
    );

    apiCourseGetPlaceCustomizeResponseDto.place_detail = customPlaceDetailFunction(
      selectedplace[0],
      apiCourseGetPlaceCustomizeResponseDto.place_type,
    );

    apiCourseGetPlaceCustomizeResponseDto.place_type = Object.entries(PLACE_TYPE).find(
      ([, val]) => val === apiCourseGetPlaceCustomizeResponseDto.place_type,
    )[0];

    apiCourseGetPlaceCustomizeResponseDto.sort = dto.place_uuids.length + 1;

    return { items: apiCourseGetPlaceCustomizeResponseDto };
  }
}
