import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DEFAULT_CUSTOMS } from 'src/commons/constants/custom-place';
import { Emojis } from 'src/commons/constants/emoji';
import { ERROR } from 'src/commons/constants/error';
import { getCustomByPlaceType } from 'src/commons/helpers/custom-by-place-type.helper';
import { getPlaceTypeKey } from 'src/commons/helpers/place-type.helper';
import { getRandomShuffleElements, getTopWeight } from 'src/commons/helpers/place-weight.helper';
import { isEmpty, isNotEmpty } from 'src/commons/util/is/is-empty';
import { generateUUID } from 'src/commons/util/uuid';
import { CourseQueryRepository } from 'src/course/course.query.repository';
import { ApiCourseGetPlaceCustomizeRequestQueryDto } from 'src/course/dto/api-course-get-place-customize-request-query.dto';
import { ApiCourseGetPlaceCustomizeResponseDto } from 'src/course/dto/api-course-get-place-customize-response.dto';
import { ApiCourseGetRecommendRequestQueryDto } from 'src/course/dto/api-course-get-recommend-request-query.dto';
import { ApiCourseGetRecommendResponseDto } from 'src/course/dto/api-course-get-recommend-response.dto';
import { CoursePlaceInfoDto } from 'src/course/dto/course-place-info.dto';
import { RecommendType } from 'src/course/enum/course-recommend.enum';
import { CourseDetailEntity } from 'src/entities/course.detail.entity';
import { PlaceEntity } from 'src/entities/place.entity';
import { ThemeEntity } from 'src/entities/theme.entity';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { SubwayQueryRepository } from 'src/subway/subway.query.repository';
import { ThemeQueryRepository } from 'src/theme/theme.query.repository';
import { UserDto } from 'src/user/dto/user.dto';

@Injectable()
export class CourseRecommendationService {
  constructor(
    private readonly courseQueryRepository: CourseQueryRepository,
    private readonly subwayQueryRepository: SubwayQueryRepository,
    private readonly placeQueryRepository: PlaceQueryRepository,
    private readonly themeQueryRepository: ThemeQueryRepository,
  ) {}

  async getCourseRecommendation(
    dto: ApiCourseGetRecommendRequestQueryDto,
    user?: UserDto,
  ): Promise<ApiCourseGetRecommendResponseDto> {
    // 1. 지하철역 및 노선 정보 조회
    const subwayWithLines = await this.subwayQueryRepository.findAllLinesForStation(
      dto.station_uuid,
    );
    if (isEmpty(subwayWithLines)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    // 2. 주변 장소 리스트 조회
    const subwayPlaceList: PlaceEntity[] = await this.placeQueryRepository.findSubwayPlaceList(
      dto,
      subwayWithLines[0].name,
    );

    // 3. 테마 및 히스토리 조회 (존재할 경우)
    const theme: ThemeEntity = isNotEmpty(dto.theme_uuid)
      ? await this.themeQueryRepository.findThemeUuid(dto.theme_uuid)
      : null;

    const userHistoryCourse: CourseDetailEntity[] = isNotEmpty(user)
      ? await this.courseQueryRepository.findUserHistoryCourse(user.uuid)
      : [];

    // 4. 각 커스텀에 해당하는 장소 조회 헬퍼 함수
    const fetchPlacesByCustom = async (custom: string): Promise<PlaceEntity[]> => {
      let placesByCategory = subwayPlaceList.filter((place) => place.place_type === custom);

      // 해당 custom에 맞는 테마가 없을 시 재추천
      if (placesByCategory.length === 0) {
        const dtoWithoutTheme = { ...dto };
        delete dtoWithoutTheme.theme_uuid;

        const fallbackPlaces = await this.placeQueryRepository.findSubwayPlaceList(
          dtoWithoutTheme,
          subwayWithLines[0].name,
        );
        placesByCategory = fallbackPlaces.filter((place) => place.place_type === custom);
      }
      return placesByCategory;
    };

    // 5. 기본 커스텀 타입별로 가중치 계산 및 랜덤 선택, 병렬 처리
    const selectionPlaces: PlaceEntity[] = (
      await Promise.all(
        DEFAULT_CUSTOMS.map(async (custom) => {
          const customPlaces = await fetchPlacesByCustom(custom);
          const topWeightedPlaces = getTopWeight(
            customPlaces,
            RecommendType.TOP_N,
            userHistoryCourse,
          );
          const selectedPlaces = getRandomShuffleElements(
            topWeightedPlaces,
            RecommendType.RANDOM_SELECTION_COUNT,
          );
          if (isEmpty(selectedPlaces)) {
            throw new NotFoundException(ERROR.NOT_EXIST_DATA);
          }
          return selectedPlaces;
        }),
      )
    ).flat();

    // 6. 커스텀 순서 정렬 및 DTO 변환
    const sortedPlaces: CoursePlaceInfoDto[] = [];
    DEFAULT_CUSTOMS.forEach((custom, index) => {
      const place = selectionPlaces.find((item) => item.place_type === custom);
      if (isEmpty(place)) {
        throw new NotFoundException(ERROR.NOT_EXIST_DATA);
      }
      const placeDetailDto = plainToInstance(CoursePlaceInfoDto, place, {
        excludeExtraneousValues: true,
      });
      placeDetailDto.sort = index + 1;
      placeDetailDto.place_type = getPlaceTypeKey(placeDetailDto.place_type);
      placeDetailDto.place_detail = getCustomByPlaceType(place, custom);
      sortedPlaces.push(placeDetailDto);
    });

    // 7. 코스 이름 생성
    let courseName = '';
    if (isEmpty(theme)) {
      const randomEmoji = Emojis[Math.floor(Math.random() * Emojis.length)];
      courseName = `${subwayWithLines[0].name}역, 주변 코스 일정 ${randomEmoji}`;
    } else {
      const themeText = theme.theme_name.substring(0, theme.theme_name.length - 2).trim();
      const themeEmoji = theme.theme_name.substring(theme.theme_name.length - 2);
      courseName = `${subwayWithLines[0].name}역, ${themeText} 코스 일정 ${themeEmoji}`;
    }

    // 7. Response 생성
    const apiCourseGetRecommendResponseDto = new ApiCourseGetRecommendResponseDto({
      course_uuid: generateUUID(),
      course_name: courseName,
      subway: {
        uuid: subwayWithLines[0].uuid,
        station: subwayWithLines[0].name,
      },
      line: subwayWithLines.map((line) => ({
        uuid: line.uuid,
        line: line.line,
      })),
      theme: theme ? { uuid: theme.uuid, theme: theme.theme_name } : undefined,
      places: sortedPlaces,
    });

    return apiCourseGetRecommendResponseDto;
  }

  async addCustomPlaceToCourse(
    dto: ApiCourseGetPlaceCustomizeRequestQueryDto,
    user?: UserDto,
  ): Promise<ApiCourseGetPlaceCustomizeResponseDto> {
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

    return apiCourseGetPlaceCustomizeResponseDto;
  }
}
