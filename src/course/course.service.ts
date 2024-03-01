import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Emojis } from 'src/auth/constants/emoji';
import { ERROR } from 'src/auth/constants/error';
import { DetailResponseDto } from 'src/commons/dto/response.dto';
import { generateUUID } from 'src/commons/util/uuid';
import { CourseDetailEntity } from 'src/entities/course.detail.entity';
import { CourseEntity } from 'src/entities/course.entity';
import { BookmarkEntity } from 'src/entities/bookmark.entity';
import { PlaceEntity } from 'src/entities/place.entity';
import { CustomListDto } from 'src/place/dto/subway.dto';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { SubwayQueryRepository } from 'src/subway/subway.query.repository';
import { CourseQueryRepository } from './course.query.repository';
import { CoursePlaceDetailDto, CoursePlaceDto } from './dto/course.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { BookmarkQueryRepository } from 'src/bookmark/bookmark.query.repository';
import { isEmpty, isNotEmpty } from 'src/commons/util/is/is-empty';
import { CommunityQueryRepository } from 'src/community/community.query.repository';
import { CommunityEntity } from 'src/entities/community.entity';
import { ReactionQueryRepository } from 'src/community/reaction.query.repository';
import { ReactionEntity } from 'src/entities/reaction.entity';
import { ApiCoursePostRecommendRequestBodyDto } from './dto/api-course-post-recommend-request-body.dto';
import { ApiSubwayGetCheckRequestQueryDto } from '../subway/dto/api-subway-get-check-request-query.dto';
import { ApiCoursePostRecommendResponseDto } from './dto/api-course-post-recommend-response.dto';
import { ApiSubwayGetCheckResponseDto } from '../subway/dto/api-subway-get-check-response.dto';
import { ApiCourseGetMyHistoryRequestQueryDto } from './dto/api-course-get-my-history-request-query.dto';
import { ApiCourseGetMyHistoryResponseDto } from './dto/api-course-get-my-history-response.dto';
import { ApiCourseGetDetailResponseDto } from './dto/api-course-get-detail-response.dto';
import { ApiCourseGetPlaceListResponseDto } from './dto/api-course-get-place-list-response.dto';
import { ApiSubwayGetListRequestQueryDto } from '../subway/dto/api-subway-get-list-request-query.dto';
import { ApiSubwayGetListResponseDto } from '../subway/dto/api-subway-get-list-response.dto';
import { ApiCourseGetRecommendRequestQueryDto } from './dto/api-course-get-recommend-request-query.dto';
import {
  ApiCourseGetRecommendResponseDto,
  PlaceDetailDto,
} from './dto/api-course-get-recommend-response.dto';
import { ApiCourseGetPlaceCustomizeRequestQueryDto } from './dto/api-course-get-place-customize-request-query.dto';
import { ApiCourseGetPlaceCustomizeResponseDto } from './dto/api-course-get-place-customize-response.dto';
import { UserDto } from 'src/user/dto/user.dto';

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
  ) {}

  async courseRecommend(dto: ApiCourseGetRecommendRequestQueryDto, user?: UserDto) {
    let defaultCustoms = ['음식점', '카페', '술집'];
    let placeNonSorting = [];

    if (dto.theme) {
      // customs = customs.filter((item) => item !== '음식점');
      // 추후 subway , place_theme , place 세개 테이블 Join
    }
    console.log(user);
    let userHistoryCourse: CourseDetailEntity[];
    if (isNotEmpty(user)) {
      userHistoryCourse = await this.courseQueryRepository.findUserHistoryCourse(user.uuid);
    }

    const subwayPlaceList: PlaceEntity[] = await this.placeQueryRepository.findSubwayPlaceList(dto);
    for (const custom of defaultCustoms) {
      const customPlace: PlaceEntity[] = subwayPlaceList.filter(
        (item) => item.place_type === custom,
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
        throw new NotFoundException(
          `${dto.subway}역에는 '${place_type}'에 해당하는 핫플레이스가 부족해요...`,
        );
      }
      const placeDetailDto = plainToInstance(PlaceDetailDto, customSortingPlace, {
        excludeExtraneousValues: true,
      });
      placeDetailDto.sort = index + 1;

      const placeDetailMapping = {
        음식점: customSortingPlace.cate_name_depth2,
        카페: customSortingPlace.brandname,
        술집: customSortingPlace.brandname,
        쇼핑: customSortingPlace.cate_name_depth1,
        전시: customSortingPlace.top_level_address,
        팝업: customSortingPlace.mainbrand,
        놀거리: customSortingPlace.cate_name_depth1,
      };
      placeDetailDto.place_detail = placeDetailMapping[place_type];
      placeSorting.push(placeDetailDto);
    }

    const themes = [];
    let course_name: string;
    let course_sub_name: string;

    if (dto.theme) themes.push(dto.theme);

    if (themes.length === 0) {
      const randomEmoji = Emojis[Math.floor(Math.random() * Emojis.length)];
      course_name = `${dto.subway}역, 주변 코스 일정 ${randomEmoji}`;
      course_sub_name = `주변 코스 일정 ${randomEmoji}`;
    } else {
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      const themeText = randomTheme.substring(0, randomTheme.length - 2).trim();
      const themeEmoji = randomTheme.substring(randomTheme.length - 2);
      course_name = `${dto.subway}역, ${themeText} 코스 일정 ${themeEmoji}`;
      course_sub_name = `${themeText} 코스 일정 ${themeEmoji}`;
    }

    const subway = await this.subwayQueryRepository.findSubway(dto.subway);

    const apiCourseGetRecommendResponseDto = new ApiCourseGetRecommendResponseDto({
      subway: `${dto.subway}역`,
      line: subway.map((item) => item.line),
      theme: dto.theme,
      course_name: course_name,
      course_sub_name: course_sub_name,
      place: placeSorting,
    });

    return apiCourseGetRecommendResponseDto;
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

  async courseDetail(uuid, user: UserDto) {
    const course = await this.courseQueryRepository.findOne(uuid);
    if (!course) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const bookmark: BookmarkEntity = await this.bookmarkQueryRepository.findUserBookmark(
      user,
      uuid,
    );
    const community: CommunityEntity = await this.communityQueryRepository.findCommunityByCourse(
      uuid,
      user,
    );
    const reaction: ReactionEntity = await this.reactionQueryRepository.findOne(uuid, user);
    const coursePlaces = await this.courseQueryRepository.findPlace(uuid);

    const apiCourseDetailGetResponseDto = new ApiCourseGetDetailResponseDto({
      course_uuid: uuid,
      course_name: course.course_name,
      subway: course.subway,
      count: coursePlaces.length,
      customs: course.customs,
      isBookmarked: isNotEmpty(bookmark),
      isPosted: isNotEmpty(community),
      isLiked: isNotEmpty(reaction),
      created_at: course.created_at,
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

    return apiCourseDetailGetResponseDto;
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

  async courseGuestPlaceCustomize(dto: ApiCourseGetPlaceCustomizeRequestQueryDto) {
    if (dto.theme) {
      // customs = customs.filter((item) => item !== '음식점');
      // 추후 subway , place_theme , place 세개 테이블 Join
    }

    const subwayPlaceCustomizeList: PlaceEntity[] =
      await this.placeQueryRepository.findSubwayPlaceCustomizeList(dto);

    const placeUuidsSet = new Set(dto.place_uuids);
    const filteredPlaceList = subwayPlaceCustomizeList.filter(
      (place) => !placeUuidsSet.has(place.uuid),
    );

    function calculateWeight(customPlace) {
      let weight = customPlace.score * Math.log(customPlace.review_count + 1);
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
      throw new NotFoundException(
        `${dto.subway}역에는 '${dto.place_type}'에 해당하는 핫플레이스가 부족해요...`,
      );
    }
    const apiCourseGetPlaceCustomizeResponseDto = plainToInstance(
      ApiCourseGetPlaceCustomizeResponseDto,
      selectedplace[0],
      {
        excludeExtraneousValues: true,
      },
    );

    const placeDetailMapping = {
      음식점: selectedplace[0].cate_name_depth2,
      카페: selectedplace[0].brandname,
      술집: selectedplace[0].brandname,
      쇼핑: selectedplace[0].cate_name_depth1,
      전시: selectedplace[0].top_level_address,
      팝업: selectedplace[0].mainbrand,
      놀거리: selectedplace[0].cate_name_depth1,
    };
    apiCourseGetPlaceCustomizeResponseDto.place_detail = placeDetailMapping[dto.place_type];

    return apiCourseGetPlaceCustomizeResponseDto;
  }

  async courseMemberPlaceCustomize(user: UserDto, dto: ApiCourseGetPlaceCustomizeRequestQueryDto) {
    if (dto.theme) {
      // customs = customs.filter((item) => item !== '음식점');
      // 추후 subway , place_theme , place 세개 테이블 Join
    }

    const userHistoryCourse: CourseDetailEntity[] =
      await this.courseQueryRepository.findUserHistoryCourse(user.uuid);

    const subwayPlaceCustomizeList: PlaceEntity[] =
      await this.placeQueryRepository.findSubwayPlaceCustomizeList(dto);

    const placeUuidsSet = new Set(dto.place_uuids);
    const filteredPlaceList = subwayPlaceCustomizeList.filter(
      (place) => !placeUuidsSet.has(place.uuid),
    );

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
      throw new NotFoundException(
        `${dto.subway}역에는 '${dto.place_type}'에 해당하는 핫플레이스가 부족해요...`,
      );
    }
    const apiCourseGetPlaceCustomizeResponseDto = plainToInstance(
      ApiCourseGetPlaceCustomizeResponseDto,
      selectedplace[0],
      {
        excludeExtraneousValues: true,
      },
    );

    const placeDetailMapping = {
      음식점: selectedplace[0].cate_name_depth2,
      카페: selectedplace[0].brandname,
      술집: selectedplace[0].brandname,
      쇼핑: selectedplace[0].cate_name_depth1,
      전시: selectedplace[0].top_level_address,
      팝업: selectedplace[0].mainbrand,
      놀거리: selectedplace[0].cate_name_depth1,
    };
    apiCourseGetPlaceCustomizeResponseDto.place_detail = placeDetailMapping[dto.place_type];

    return apiCourseGetPlaceCustomizeResponseDto;
  }
}
