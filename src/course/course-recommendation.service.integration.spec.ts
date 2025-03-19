import { NotFoundException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DEFAULT_CUSTOMS } from 'src/commons/constants/custom-place';
import { CourseRecommendationService } from 'src/course/course-recommendation.service';
import { CourseModule } from 'src/course/course.module';
import { ApiCourseGetPlaceCustomizeRequestQueryDto } from 'src/course/dto/api-course-get-place-customize-request-query.dto';
import { ApiCourseGetRecommendRequestQueryDto } from 'src/course/dto/api-course-get-recommend-request-query.dto';
import { BookmarkEntity } from 'src/entities/bookmark.entity';
import { CommentEntity } from 'src/entities/comment.entity';
import { CommunityEntity } from 'src/entities/community.entity';
import { CourseDetailEntity } from 'src/entities/course.detail.entity';
import { CourseEntity } from 'src/entities/course.entity';
import { PlaceEntity } from 'src/entities/place.entity';
import { PlaceThemeEntity } from 'src/entities/place_theme.entity';
import { ReactionEntity } from 'src/entities/reaction.entity';
import { SubwayEntity } from 'src/entities/subway.entity';
import { SubwayStationEntity } from 'src/entities/subway_station.entity';
import { ThemeEntity } from 'src/entities/theme.entity';
import { UserEntity } from 'src/entities/user.entity';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { SubwayQueryRepository } from 'src/subway/subway.query.repository';
import { ThemeQueryRepository } from 'src/theme/theme.query.repository';
import { UserDto } from 'src/user/dto/user.dto';
import { DataSource } from 'typeorm';

jest.setTimeout(30000);

describe('CourseRecommendationService Integration Test', () => {
  let app;
  let service: CourseRecommendationService;
  let dataSource: DataSource;
  let subwayQueryRepository: SubwayQueryRepository;
  let placeQueryRepository: PlaceQueryRepository;
  let themeQueryRepository: ThemeQueryRepository;

  const createUser = (): UserDto => ({
    uuid: 'dummy-user-uuid',
    id: 1,
    nickname: 'TestUser',
    profile_image: 'test.png',
  });

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [
            CourseEntity,
            CourseDetailEntity,
            BookmarkEntity,
            PlaceEntity,
            SubwayEntity,
            SubwayStationEntity,
            PlaceThemeEntity,
            ThemeEntity,
            CommunityEntity,
            ReactionEntity,
            CommentEntity,
            UserEntity,
          ],
          logging: false,
        }),
        TypeOrmModule.forFeature([
          CourseEntity,
          CourseDetailEntity,
          BookmarkEntity,
          PlaceEntity,
          SubwayEntity,
          SubwayStationEntity,
          PlaceThemeEntity,
          ThemeEntity,
          CommunityEntity,
          ReactionEntity,
          CommentEntity,
          UserEntity,
        ]),
        CourseModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    service = moduleRef.get<CourseRecommendationService>(CourseRecommendationService);
    dataSource = moduleRef.get<DataSource>(DataSource);
    subwayQueryRepository = moduleRef.get<SubwayQueryRepository>(SubwayQueryRepository);
    placeQueryRepository = moduleRef.get<PlaceQueryRepository>(PlaceQueryRepository);
    themeQueryRepository = moduleRef.get<ThemeQueryRepository>(ThemeQueryRepository);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  const setupRepositoryMocks = () => {
    // given
    jest
      .spyOn(subwayQueryRepository, 'findAllLinesForStation')
      .mockResolvedValue([{ uuid: 'subway-uuid', name: 'Test Station', line: 'Test Line' }] as any);
    jest.spyOn(subwayQueryRepository, 'findSubwayStationUuid').mockResolvedValue({
      uuid: 'station-uuid',
      name: 'Test Station',
    } as any);
    jest.spyOn(placeQueryRepository, 'findSubwayPlaceList').mockResolvedValue(
      DEFAULT_CUSTOMS.map(
        (custom, index) =>
          ({
            uuid: `place-${index + 1}`,
            place_name: `Place ${index + 1}`,
            place_type: custom,
          } as any),
      ),
    );
    jest
      .spyOn(placeQueryRepository, 'findSubwayPlacesCustomizeList')
      .mockResolvedValue([
        { uuid: 'custom-place', place_name: 'Custom Place', place_type: 'CULTURE' },
      ] as any);
    jest
      .spyOn(placeQueryRepository, 'findSubwayPlacesCustomizeCultureList')
      .mockResolvedValue([
        { uuid: 'custom-place-culture', place_name: 'Custom Place Culture', place_type: 'CULTURE' },
      ] as any);
    jest.spyOn(themeQueryRepository, 'findThemeUuid').mockResolvedValue({
      uuid: 'dummy-theme-uuid',
      theme_name: 'Test Theme',
    } as any);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupRepositoryMocks();
  });

  describe('getCourseRecommendation', () => {
    it('should return a valid course recommendation', async () => {
      // given
      const dto: ApiCourseGetRecommendRequestQueryDto = {
        station_uuid: 'station-uuid',
        theme_uuid: 'dummy-theme-uuid',
      };
      const user = createUser();
      // when
      const result = await service.getCourseRecommendation(dto, user);
      // then
      expect(result).toHaveProperty('course_uuid');
      expect(result).toHaveProperty('course_name');
      expect(result).toHaveProperty('subway');
      expect(result).toHaveProperty('line');
      expect(result).toHaveProperty('places');
      expect(result.places.length).toEqual(DEFAULT_CUSTOMS.length);
    });

    it('should throw NotFoundException if subway station info is not found', async () => {
      // given
      const dto: ApiCourseGetRecommendRequestQueryDto = {
        station_uuid: 'invalid-station',
        theme_uuid: 'dummy-theme-uuid',
      };
      jest.spyOn(subwayQueryRepository, 'findAllLinesForStation').mockResolvedValue([]);
      // when, then
      await expect(service.getCourseRecommendation(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addCustomPlaceToCourse', () => {
    it('should return a customized place response', async () => {
      // given
      const dto: ApiCourseGetPlaceCustomizeRequestQueryDto = {
        station_uuid: 'station-uuid',
        place_type: 'CULTURE',
        place_uuids: [],
      };
      // when
      const result = await service.addCustomPlaceToCourse(dto);
      // then
      expect(result).toHaveProperty('sort', 1);
      expect(result).toHaveProperty('place_detail');
      expect(result).toHaveProperty('place_type');
    });

    it('should throw NotFoundException if subway station is not found', async () => {
      // given
      const dto: ApiCourseGetPlaceCustomizeRequestQueryDto = {
        station_uuid: 'invalid-station',
        place_type: 'CULTURE',
        place_uuids: [],
      };
      jest.spyOn(subwayQueryRepository, 'findSubwayStationUuid').mockResolvedValue(null);
      // when, then
      await expect(service.addCustomPlaceToCourse(dto)).rejects.toThrow(NotFoundException);
    });
  });
});
