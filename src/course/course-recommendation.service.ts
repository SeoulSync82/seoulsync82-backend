import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/commons/constants/error';
import { getPlaceTypeKey } from 'src/commons/helpers/place-type.helper';
import { getRandomShuffleElements, getTopWeight } from 'src/commons/helpers/place-weight.helper';
import { generateUUID } from 'src/commons/util/uuid';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { SubwayQueryRepository } from 'src/subway/subway.query.repository';
import { ThemeQueryRepository } from 'src/theme/theme.query.repository';
import { DEFAULT_CUSTOMS } from '../commons/constants/custom-place';
import { Emojis } from '../commons/constants/emoji';
import { getCustomByPlaceType } from '../commons/helpers/custom-by-place-type.helper';
import { isEmpty, isNotEmpty } from '../commons/util/is/is-empty';
import { CourseDetailEntity } from '../entities/course.detail.entity';
import { PlaceEntity } from '../entities/place.entity';
import { UserDto } from '../user/dto/user.dto';
import { CourseQueryRepository } from './course.query.repository';
import { ApiCourseGetPlaceCustomizeRequestQueryDto } from './dto/api-course-get-place-customize-request-query.dto';
import { ApiCourseGetPlaceCustomizeResponseDto } from './dto/api-course-get-place-customize-response.dto';
import { ApiCourseGetRecommendRequestQueryDto } from './dto/api-course-get-recommend-request-query.dto';
import {
  ApiCourseGetRecommendResponseDto,
  PlaceDetailDto,
} from './dto/api-course-get-recommend-response.dto';
import { RecommendType } from './enum/course-recommend.enum';

@Injectable()
export class CourseRecommendationService {
  constructor(
    private readonly courseQueryRepository: CourseQueryRepository,
    private readonly subwayQueryRepository: SubwayQueryRepository,
    private readonly placeQueryRepository: PlaceQueryRepository,
    private readonly themeQueryRepository: ThemeQueryRepository,
  ) {}

  async getCourseRecommendation(dto: ApiCourseGetRecommendRequestQueryDto, user?: UserDto) {
    // 1. 지하철역 조회
    const subwayWithLines = await this.subwayQueryRepository.findAllLinesForStation(
      dto.station_uuid,
    );
    if (isEmpty(subwayWithLines)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    // 2. 테마 조회 (선택한 경우)
    let theme = null;
    if (isNotEmpty(dto.theme_uuid)) {
      theme = await this.themeQueryRepository.findThemeUuid(dto.theme_uuid);
    }

    // 3. 주변 장소 리스트 조회
    const subwayPlaceList: PlaceEntity[] = await this.placeQueryRepository.findSubwayPlaceList(
      dto,
      subwayWithLines[0].name,
    );

    // 4. 기본 커스텀(음식점, 카페, 술집)별로 필터 및 가중치 계산 후 최상위 N개 중 랜덤 선택
    const placeNonSorting: PlaceEntity[] = [];

    let userHistoryCourse: CourseDetailEntity[];
    if (isNotEmpty(user)) {
      userHistoryCourse = await this.courseQueryRepository.findUserHistoryCourse(user.uuid);
    }

    for (const custom of DEFAULT_CUSTOMS) {
      const customPlaces: PlaceEntity[] = subwayPlaceList.filter(
        (item) => item.place_type === custom,
      );

      const topWeightedPlaces = getTopWeight(customPlaces, RecommendType.TOP_N, userHistoryCourse);
      const selected = getRandomShuffleElements(
        topWeightedPlaces,
        RecommendType.RANDOM_SELECTION_COUNT,
      );
      if (isEmpty(selected)) {
        throw new NotFoundException(ERROR.NOT_EXIST_DATA);
      }
      placeNonSorting.push(...selected);
    }

    // 5. 카테고리별 정렬 및 DTO 변환
    const placeSorting: PlaceDetailDto[] = [];
    DEFAULT_CUSTOMS.forEach((custom, index) => {
      const place = placeNonSorting.find((item) => item.place_type === custom);
      if (isEmpty(place)) {
        throw new NotFoundException(ERROR.NOT_EXIST_DATA);
      }
      const placeDetailDto = plainToInstance(PlaceDetailDto, place, {
        excludeExtraneousValues: true,
      });
      placeDetailDto.sort = index + 1;
      placeDetailDto.place_type = getPlaceTypeKey(placeDetailDto.place_type);
      placeDetailDto.place_detail = getCustomByPlaceType(place, custom);
      placeSorting.push(placeDetailDto);
    });

    // 6. 코스 이름 생성
    let course_name = '';
    if (isEmpty(theme)) {
      const randomEmoji = Emojis[Math.floor(Math.random() * Emojis.length)];
      course_name = `${subwayWithLines[0].name}역, 주변 코스 일정 ${randomEmoji}`;
    } else {
      const themeText = theme.theme_name.substring(0, theme.theme_name.length - 2).trim();
      const themeEmoji = theme.theme_name.substring(theme.theme_name.length - 2);
      course_name = `${subwayWithLines[0].name}역, ${themeText} 코스 일정 ${themeEmoji}`;
    }

    // 7. Response 생성
    const apiCourseGetRecommendResponseDto = new ApiCourseGetRecommendResponseDto({
      course_uuid: generateUUID(),
      course_name,
      subway: {
        uuid: subwayWithLines[0].uuid,
        station: subwayWithLines[0].name,
      },
      line: subwayWithLines.map((line) => ({
        uuid: line.uuid,
        line: line.line,
      })),
      theme: theme ? { uuid: theme.uuid, theme: theme.theme_name } : undefined,
      places: placeSorting,
    });

    return { items: apiCourseGetRecommendResponseDto };
  }

  async addCustomPlaceToCourse(dto: ApiCourseGetPlaceCustomizeRequestQueryDto, user?: UserDto) {
    // 1. 추가 할 지하철역 조회
    const subwayStation = await this.subwayQueryRepository.findSubwayStationUuid(dto.station_uuid);
    if (isEmpty(subwayStation)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    // 2. 장소 목록 조회
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

    // 3. 이미 선택되어 있는 장소 제외
    const placeUuidsSet = new Set(dto.place_uuids);
    const filteredPlaceList = subwayPlaceCustomizeList.filter(
      (place) => !placeUuidsSet.has(place.uuid),
    );

    // 4. 사용자 방문 기록 조회
    let userHistoryCourse: CourseDetailEntity[];
    if (isNotEmpty(user)) {
      userHistoryCourse = await this.courseQueryRepository.findUserHistoryCourse(user.uuid);
    }

    // 5. 상위 N개 중 랜덤한 장소 선택
    const topWeightedPlaces = getTopWeight(
      filteredPlaceList,
      RecommendType.TOP_N,
      userHistoryCourse,
    );
    const selected = getRandomShuffleElements(
      topWeightedPlaces,
      RecommendType.RANDOM_SELECTION_COUNT,
    );
    if (isEmpty(selected)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }
    const selectedPlace = selected[0];

    // 6. Response 생성
    const apiCourseGetPlaceCustomizeResponseDto = plainToInstance(
      ApiCourseGetPlaceCustomizeResponseDto,
      {
        ...selectedPlace,
        place_detail: getCustomByPlaceType(selectedPlace, selectedPlace.place_type),
        place_type: getPlaceTypeKey(selectedPlace.place_type),
        sort: dto.place_uuids.length + 1,
      },
      { excludeExtraneousValues: true },
    );

    return { items: apiCourseGetPlaceCustomizeResponseDto };
  }
}
