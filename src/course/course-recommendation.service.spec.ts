import { TestBed } from '@automock/jest';
import { NotFoundException } from '@nestjs/common';
import { DEFAULT_CUSTOMS } from 'src/commons/constants/custom-place';
import * as CustomByPlaceTypeHelper from 'src/commons/helpers/custom-by-place-type.helper';
import * as PlaceTypeHelper from 'src/commons/helpers/place-type.helper';
import * as PlaceWeightHelper from 'src/commons/helpers/place-weight.helper';
import * as UUIDUtil from 'src/commons/util/uuid';
import { CourseQueryRepository } from 'src/course/course.query.repository';
import { ApiCourseGetPlaceCustomizeRequestQueryDto } from 'src/course/dto/api-course-get-place-customize-request-query.dto';
import { ApiCourseGetRecommendRequestQueryDto } from 'src/course/dto/api-course-get-recommend-request-query.dto';
import { ApiCourseGetRecommendResponseDto } from 'src/course/dto/api-course-get-recommend-response.dto';
import { CourseDetailEntity } from 'src/entities/course.detail.entity';
import { PlaceEntity } from 'src/entities/place.entity';
import { ThemeEntity } from 'src/entities/theme.entity';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { SubwayQueryRepository } from 'src/subway/subway.query.repository';
import { ThemeQueryRepository } from 'src/theme/theme.query.repository';
import { UserDto } from 'src/user/dto/user.dto';
import { CourseRecommendationService } from './course-recommendation.service';

describe('CourseRecommendationService', () => {
  let service: CourseRecommendationService;
  let courseQueryRepository: jest.Mocked<CourseQueryRepository>;
  let subwayQueryRepository: jest.Mocked<SubwayQueryRepository>;
  let placeQueryRepository: jest.Mocked<PlaceQueryRepository>;
  let themeQueryRepository: jest.Mocked<ThemeQueryRepository>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(CourseRecommendationService).compile();
    service = unit;
    courseQueryRepository = unitRef.get(CourseQueryRepository);
    subwayQueryRepository = unitRef.get(SubwayQueryRepository);
    placeQueryRepository = unitRef.get(PlaceQueryRepository);
    themeQueryRepository = unitRef.get(ThemeQueryRepository);
    jest.clearAllMocks();
  });

  describe('getCourseRecommendation', () => {
    const dto: ApiCourseGetRecommendRequestQueryDto = {
      station_uuid: 'station-uuid',
      theme_uuid: 'theme-uuid',
    } as ApiCourseGetRecommendRequestQueryDto;
    const user: UserDto = { uuid: 'user-uuid', nickname: 'UserName' } as UserDto;

    const dummySubwayWithLines = [
      {
        id: 1,
        uuid: 'line-1',
        name: 'Station A',
        line: 'Line 1',
        line_uuid: 'line-uuid',
        latitude: 0,
        longitude: 0,
      },
    ];

    const baseDummyPlace: Partial<PlaceEntity> = {
      id: 1,
      uuid: 'place-uuid',
      place_name: 'Place 1',
      place_type: DEFAULT_CUSTOMS[0],
      operation_time: '',
      closed_days: '',
      entrance_fee: '',
      thumbnail: '',
      latitude: 0,
      longitude: 0,
      address: '',
      tel: '',
      url: '',
      score: 0,
    };
    const dummyPlaces: (PlaceEntity & { weight: number })[] = DEFAULT_CUSTOMS.map((custom) => ({
      ...baseDummyPlace,
      uuid: `place-${custom}`,
      place_name: `Place for ${custom}`,
      place_type: custom,
      weight: 1,
    })) as (PlaceEntity & { weight: number })[];

    const dummyTheme: ThemeEntity = {
      id: 1,
      uuid: 'theme-uuid',
      theme_name: 'ThemeName',
    } as ThemeEntity;
    const dummyHistory: CourseDetailEntity[] = [
      { course_uuid: 'course-uuid' },
    ] as CourseDetailEntity[];

    beforeEach(() => {
      subwayQueryRepository.findAllLinesForStation.mockResolvedValue(dummySubwayWithLines);
      placeQueryRepository.findSubwayPlaceList.mockResolvedValue(dummyPlaces);
      themeQueryRepository.findThemeUuid.mockResolvedValue(dummyTheme);
      courseQueryRepository.findUserHistoryCourse.mockResolvedValue(dummyHistory);

      jest
        .spyOn(PlaceWeightHelper, 'getTopWeight')
        .mockImplementation((places, _topN, _userHistoryCourse) =>
          places.map((place) => ({ ...place, weight: 1 })),
        );
      jest
        .spyOn(PlaceWeightHelper, 'getRandomShuffleElements')
        .mockImplementation((places, count) => places.slice(0, count));
      jest.spyOn(UUIDUtil, 'generateUUID').mockReturnValue('generated-course-uuid');
      jest.spyOn(PlaceTypeHelper, 'getPlaceTypeKey').mockImplementation((pt) => pt);
      jest
        .spyOn(CustomByPlaceTypeHelper, 'getCustomByPlaceType')
        .mockImplementation((place, _custom) => `custom-${place.uuid}`);
    });

    it('should throw NotFoundException when subwayWithLines is empty', async () => {
      // Given
      subwayQueryRepository.findAllLinesForStation.mockResolvedValue([]);
      // When & Then
      await expect(service.getCourseRecommendation(dto, user)).rejects.toThrow(NotFoundException);
    });

    it('should set theme to null when dto.theme_uuid is falsy', async () => {
      // Given
      const dtoWithoutTheme = { ...dto, theme_uuid: '' } as ApiCourseGetRecommendRequestQueryDto;
      // When
      const response = await service.getCourseRecommendation(dtoWithoutTheme, user);
      // Then
      expect(response.theme).toBeUndefined();
      expect(response.course_name).toContain('역, 주변 코스 일정');
    });

    it('should set userHistoryCourse to empty array when user is not provided', async () => {
      // When
      const response = await service.getCourseRecommendation(dto, undefined);
      // Then
      expect(response).toBeInstanceOf(ApiCourseGetRecommendResponseDto);
    });

    it('should generate courseName using theme when theme is provided', async () => {
      // Given
      const response = await service.getCourseRecommendation(dto, user);
      // Then

      const expectedSuffix = dummyTheme.theme_name.slice(-2);
      expect(response.course_name).toContain(expectedSuffix);
    });

    it('should throw NotFoundException when any custom selection yields empty array', async () => {
      // Given
      jest.spyOn(PlaceWeightHelper, 'getRandomShuffleElements').mockReturnValueOnce([]);
      // When & Then
      await expect(service.getCourseRecommendation(dto, user)).rejects.toThrow(NotFoundException);
    });

    it('should use fallback when initial custom selection yields empty', async () => {
      // Given
      const modifiedPlaces = dummyPlaces.filter((place) => place.place_type !== DEFAULT_CUSTOMS[0]);
      const fallbackPlace: PlaceEntity & { weight: number } = {
        ...baseDummyPlace,
        id: 999,
        uuid: 'fallback-place-uuid',
        place_name: 'Fallback Place',
        place_type: DEFAULT_CUSTOMS[0],
        weight: 1,
      } as any;
      jest
        .spyOn(placeQueryRepository, 'findSubwayPlaceList')
        .mockResolvedValueOnce(modifiedPlaces)
        .mockResolvedValueOnce([fallbackPlace]);
      // When
      const response = await service.getCourseRecommendation(dto, user);
      // Then
      const found = response.places.find((p) => p.uuid === fallbackPlace.uuid);
      expect(found).toBeDefined();
    });

    it('should return a valid recommendation response dto', async () => {
      // Given
      const response = await service.getCourseRecommendation(dto, user);
      // Then
      expect(response).toBeInstanceOf(ApiCourseGetRecommendResponseDto);
      expect(response.course_uuid).toBe('generated-course-uuid');
      expect(response.course_name).toContain(dummySubwayWithLines[0].name);
      expect(response.subway).toEqual({
        uuid: dummySubwayWithLines[0].uuid,
        station: dummySubwayWithLines[0].name,
      });
      expect(response.theme).toEqual({ uuid: dummyTheme.uuid, theme: dummyTheme.theme_name });
      expect(response.places.length).toBe(DEFAULT_CUSTOMS.length);
    });
  });

  describe('addCustomPlaceToCourse', () => {
    const dto: ApiCourseGetPlaceCustomizeRequestQueryDto = {
      station_uuid: 'station-uuid',
      place_type: 'CULTURE',
      place_uuids: ['already-selected'],
      theme_uuid: 'theme-uuid',
    } as ApiCourseGetPlaceCustomizeRequestQueryDto;
    const user: UserDto = { uuid: 'user-uuid', nickname: 'UserName' } as UserDto;

    const dummySubwayStation = {
      id: 1,
      uuid: 'station-uuid',
      name: 'Subway Station',
      line: 'Line 1',
      line_uuid: 'line-uuid',
      latitude: 0,
      longitude: 0,
    };
    const dummyPlace: PlaceEntity = {
      id: 1,
      uuid: 'place-uuid',
      place_name: 'Place 1',
      place_type: 'CULTURE',
      operation_time: '',
      closed_days: '',
      entrance_fee: '',
      thumbnail: '',
      latitude: 0,
      longitude: 0,
      address: '',
      tel: '',
      url: '',
      score: 0,
    } as PlaceEntity;

    beforeEach(() => {
      placeQueryRepository.findSubwayPlacesCustomizeCultureList.mockResolvedValue([dummyPlace]);
      placeQueryRepository.findSubwayPlacesCustomizeList.mockResolvedValue([dummyPlace]);
    });

    it('should use non-CULTURE branch when place_type is not CULTURE', async () => {
      // Given
      const dtoNonCulture: ApiCourseGetPlaceCustomizeRequestQueryDto = {
        station_uuid: 'station-uuid',
        place_type: 'FOOD',
        place_uuids: [],
        theme_uuid: 'theme-uuid',
      } as ApiCourseGetPlaceCustomizeRequestQueryDto;

      jest
        .spyOn(subwayQueryRepository, 'findSubwayStationUuid')
        .mockResolvedValue(dummySubwayStation);
      placeQueryRepository.findSubwayPlacesCustomizeList.mockResolvedValue([dummyPlace]);

      // When
      const response = await service.addCustomPlaceToCourse(dtoNonCulture, user);

      // Then
      expect(placeQueryRepository.findSubwayPlacesCustomizeList).toHaveBeenCalledWith(
        dtoNonCulture,
        dummySubwayStation.name,
      );
      expect(response).toHaveProperty('uuid', dummyPlace.uuid);
    });

    it('should handle no user scenario correctly in addCustomPlaceToCourse', async () => {
      // Given
      const dtoWithoutUser: ApiCourseGetPlaceCustomizeRequestQueryDto = {
        station_uuid: 'station-uuid',
        place_type: 'CULTURE',
        place_uuids: [],
        theme_uuid: 'theme-uuid',
      } as ApiCourseGetPlaceCustomizeRequestQueryDto;

      jest
        .spyOn(subwayQueryRepository, 'findSubwayStationUuid')
        .mockResolvedValue(dummySubwayStation);
      placeQueryRepository.findSubwayPlacesCustomizeCultureList.mockResolvedValue([dummyPlace]);

      // When
      const response = await service.addCustomPlaceToCourse(dtoWithoutUser, undefined);

      // Then
      expect(response).toHaveProperty('uuid', dummyPlace.uuid);
      expect(response.sort).toBe(dtoWithoutUser.place_uuids.length + 1);
    });

    it('should throw NotFoundException when subway station is not found', async () => {
      // Given
      jest.spyOn(subwayQueryRepository, 'findSubwayStationUuid').mockResolvedValue(null);
      // When & Then
      await expect(service.addCustomPlaceToCourse(dto, user)).rejects.toThrow(NotFoundException);
    });

    it('should return a valid customize response dto when places are available', async () => {
      // Given
      jest
        .spyOn(subwayQueryRepository, 'findSubwayStationUuid')
        .mockResolvedValue(dummySubwayStation);
      // When
      const response = await service.addCustomPlaceToCourse(dto, user);
      // Then
      expect(response).toHaveProperty('uuid', dummyPlace.uuid);
      expect(response).toHaveProperty('place_detail');
      expect(response.sort).toBe(dto.place_uuids.length + 1);
    });

    it('should re-fetch places if filtered list is empty', async () => {
      // Given
      const dummyPlace2: PlaceEntity = {
        id: 2,
        uuid: 'place-2',
        place_name: 'Place 2',
        place_type: 'CULTURE',
        operation_time: '',
        closed_days: '',
        entrance_fee: '',
        thumbnail: '',
        latitude: 0,
        longitude: 0,
        address: '',
        tel: '',
        url: '',
        score: 0,
      } as PlaceEntity;
      placeQueryRepository.findSubwayPlacesCustomizeCultureList.mockResolvedValue([dummyPlace2]);
      const dtoWithSelected: ApiCourseGetPlaceCustomizeRequestQueryDto = {
        ...dto,
        place_uuids: ['place-2'],
      };
      placeQueryRepository.findSubwayPlacesCustomizeList.mockResolvedValue([dummyPlace]);
      jest
        .spyOn(subwayQueryRepository, 'findSubwayStationUuid')
        .mockResolvedValue(dummySubwayStation);
      // When
      const response = await service.addCustomPlaceToCourse(dtoWithSelected, user);
      // Then
      expect(response.uuid).toBe(dummyPlace.uuid);
    });

    it('should throw NotFoundException when random selection returns empty', async () => {
      // Given
      jest.spyOn(PlaceWeightHelper, 'getRandomShuffleElements').mockReturnValue([]);
      jest
        .spyOn(subwayQueryRepository, 'findSubwayStationUuid')
        .mockResolvedValue(dummySubwayStation);
      // When & Then
      await expect(service.addCustomPlaceToCourse(dto, user)).rejects.toThrow(NotFoundException);
    });
  });
});
