import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtOptionalAuthGuard } from 'src/auth/guards/jwt-optional.guard';
import { CourseRecommendationService } from 'src/course/course-recommendation.service';
import { CourseModule } from 'src/course/course.module';
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
import { SubwayQueryRepository } from 'src/subway/subway.query.repository';
import { ThemeQueryRepository } from 'src/theme/theme.query.repository';
import * as request from 'supertest';
import { DataSource, Repository } from 'typeorm';

jest.setTimeout(30000);

describe('Course E2E Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let courseRepo: Repository<CourseEntity>;
  let placeRepo: Repository<PlaceEntity>;
  let courseRecService: CourseRecommendationService;
  let subwayRepo: SubwayQueryRepository;
  let themeRepo: ThemeQueryRepository;

  const entities = [
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
  ];

  const mockSubwayAndTheme = (): void => {
    jest
      .spyOn(subwayRepo, 'findAllLinesForStation')
      .mockResolvedValue([
        { uuid: 'test-subway-uuid', name: 'testStation', line: 'testLine' },
      ] as any);
    jest
      .spyOn(subwayRepo, 'findSubwayStationName')
      .mockResolvedValue({ uuid: 'test-subway-uuid', name: 'testStation' } as any);
    jest
      .spyOn(subwayRepo, 'findSubway')
      .mockResolvedValue([{ uuid: 'test-line-uuid', line: 'testLine' }] as any);
    jest
      .spyOn(themeRepo, 'findThemeUuid')
      .mockResolvedValue({ uuid: 'test-theme-uuid', theme_name: 'testTheme' } as any);
  };

  const testUser = {
    uuid: 'test-user-uuid',
    id: 1,
    nickname: 'testUser',
    name: 'testUser',
    email: 'test@example.com',
    profile_image: 'test.png',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CourseModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities,
          logging: false,
        }),
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = testUser;
          return true;
        },
      })
      .overrideGuard(JwtOptionalAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          if (!req.user) req.user = testUser;
          return true;
        },
      })
      .overrideProvider(CourseRecommendationService)
      .useValue({
        getCourseRecommendation: jest.fn(async (_dto: any) => ({
          course_uuid: 'test-recommend-course-uuid',
          course_name: 'testRecommendCourse',
          subway: { uuid: 'test-subway-uuid', station: 'testStation' },
          line: [{ uuid: 'test-line-uuid', line: 'testLine' }],
          theme: { uuid: 'test-theme-uuid', theme: 'testTheme' },
          places: [],
        })),
        addCustomPlaceToCourse: jest.fn(async (_dto: any, _user?: any) => ({
          sort: 1,
          uuid: 'test-custom-place-uuid',
          place_name: 'testCustomPlace',
          place_type: 'SHOPPING',
          thumbnail: 'http://example.com/test-thumbnail.jpg',
          address: 'testAddress',
          latitude: 1.2345,
          longitude: 6.789,
          score: 4.0,
          place_detail: 'testDetail',
        })),
      } as unknown as Partial<CourseRecommendationService>)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    dataSource = app.get<DataSource>(DataSource);
    courseRepo = dataSource.getRepository(CourseEntity);
    placeRepo = dataSource.getRepository(PlaceEntity);
    courseRecService = module.get<CourseRecommendationService>(CourseRecommendationService);
    subwayRepo = module.get<SubwayQueryRepository>(SubwayQueryRepository);
    themeRepo = module.get<ThemeQueryRepository>(ThemeQueryRepository);
  });

  afterEach(async () => {
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /api/course/recommend/save', () => {
    it('Given valid data, When saving course recommendation, Then should return 201 and save course', async () => {
      // Given
      mockSubwayAndTheme();

      const resolvePlaceName = (uuid: string): string => {
        switch (uuid) {
          case 'test-place-uuid-1':
            return 'testPlace1';
          case 'test-place-uuid-2':
            return 'testPlace2';
          case 'test-place-uuid-3':
            return 'testPlace3';
          default:
            return 'unknownPlace';
        }
      };

      await Promise.all(
        ['test-place-uuid-1', 'test-place-uuid-2', 'test-place-uuid-3'].map(async (uuid) => {
          await placeRepo.save({
            uuid,
            place_name: resolvePlaceName(uuid),
            place_type: 'POPUP',
            operation_time: '',
            closed_days: '',
            entrance_fee: '',
            thumbnail: 'http://example.com/test-thumb.jpg',
            latitude: '1.1111',
            longitude: '2.2222',
            address: 'testAddress',
            tel: '',
            url: '',
            score: '4.0',
            kakao_rating: 0,
            review_count: 0,
            start_date: null,
            end_date: null,
            cate_name_depth1: '',
            cate_name_depth2: '',
            cate_name_depth3: '',
            brandname: '',
            mainbrand: '',
            hashtag: '',
            contents: '',
            top_level_address: '',
            subways: [],
            placeThemes: [],
            courseDetails: [],
          } as any);
        }),
      );
      const dto = {
        station_uuid: 'test-station-uuid',
        theme_uuid: 'test-theme-uuid',
        course_uuid: 'test-course-uuid',
        course_name: 'testCourseName',
        places: [
          {
            sort: 1,
            uuid: 'test-place-uuid-1',
            place_name: 'testPlace1',
            place_type: 'SHOPPING',
            thumbnail: 'http://example.com/test-thumb1.jpg',
            address: 'testAddress1',
            latitude: '1.1111',
            longitude: '2.2222',
            score: '4.0',
            place_detail: 'testDetail1',
          },
          {
            sort: 2,
            uuid: 'test-place-uuid-2',
            place_name: 'testPlace2',
            place_type: 'POPUP',
            thumbnail: 'http://example.com/test-thumb2.jpg',
            address: 'testAddress2',
            latitude: '1.3333',
            longitude: '2.4444',
            score: '4.0',
            place_detail: 'testDetail2',
          },
          {
            sort: 3,
            uuid: 'test-place-uuid-3',
            place_name: 'testPlace3',
            place_type: 'RESTAURANT',
            thumbnail: 'http://example.com/test-thumb3.jpg',
            address: 'testAddress3',
            latitude: '1.5555',
            longitude: '2.6666',
            score: '4.0',
            place_detail: 'testDetail3',
          },
        ],
      };
      // When
      const response = await request(app.getHttpServer())
        .post('/api/course/recommend/save')
        .send(dto);
      // Then
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('uuid', dto.course_uuid);
      const savedCourse = await courseRepo.findOne({ where: { uuid: dto.course_uuid } });
      expect(savedCourse).toBeDefined();
      expect(savedCourse?.course_name).toEqual(dto.course_name);
      expect(subwayRepo.findAllLinesForStation).toHaveBeenCalled();
      expect(themeRepo.findThemeUuid).toHaveBeenCalled();
    });

    it('Given duplicate course, When saving course recommendation, Then should return 409', async () => {
      // Given
      const dto = {
        station_uuid: 'test-station-uuid',
        theme_uuid: 'test-theme-uuid',
        course_uuid: 'test-course-uuid',
        course_name: 'testDuplicateCourse',
        places: [
          {
            sort: 1,
            uuid: 'test-place-uuid-1',
            place_name: 'testPlace1',
            place_type: 'POPUP',
            thumbnail: 'http://example.com/test-thumb1.jpg',
            address: 'testAddress1',
            latitude: '1.1111',
            longitude: '2.2222',
            score: '4.0',
            place_detail: 'testDetail1',
          },
          {
            sort: 2,
            uuid: 'test-place-uuid-2',
            place_name: 'testPlace2',
            place_type: 'POPUP',
            thumbnail: 'http://example.com/test-thumb2.jpg',
            address: 'testAddress2',
            latitude: '1.3333',
            longitude: '2.4444',
            score: '4.0',
            place_detail: 'testDetail2',
          },
          {
            sort: 3,
            uuid: 'test-place-uuid-3',
            place_name: 'testPlace3',
            place_type: 'POPUP',
            thumbnail: 'http://example.com/test-thumb3.jpg',
            address: 'testAddress3',
            latitude: '1.5555',
            longitude: '2.6666',
            score: '4.0',
            place_detail: 'testDetail3',
          },
        ],
      };
      // When
      await courseRepo.save({
        uuid: dto.course_uuid,
        course_name: dto.course_name,
        line: 'testLine',
        subway: 'testStation',
        user_uuid: testUser.uuid,
        user_name: testUser.nickname,
        count: 0,
        theme: null,
        customs: '',
      });
      const response = await request(app.getHttpServer())
        .post('/api/course/recommend/save')
        .send(dto);
      // Then
      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/course/:uuid', () => {
    it('Given existing course, When retrieving course detail, Then should return 200 with course data', async () => {
      // Given
      await courseRepo.save({
        uuid: 'test-course-detail-uuid',
        course_name: 'testCourseDetail',
        line: 'testLine',
        subway: 'testStation',
        user_uuid: testUser.uuid,
        user_name: testUser.nickname,
        count: 2,
        theme: 'testTheme',
        customs: 'POPUP',
        created_at: new Date(),
      });
      jest
        .spyOn(subwayRepo, 'findSubwayStationName')
        .mockResolvedValue({ uuid: 'test-subway-uuid', name: 'testStation' } as any);
      jest
        .spyOn(subwayRepo, 'findSubway')
        .mockResolvedValue([{ uuid: 'test-line-uuid', line: 'testLine' }] as any);
      jest
        .spyOn(themeRepo, 'findThemeName')
        .mockResolvedValue({ uuid: 'test-theme-uuid', theme_name: 'testTheme' } as any);
      // When
      const response = await request(app.getHttpServer()).get(
        '/api/course/test-course-detail-uuid',
      );
      // Then
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('course_uuid', 'test-course-detail-uuid');
      expect(response.body).toHaveProperty('course_name', 'testCourseDetail');
    });

    it('Given non-existing course, When retrieving course detail, Then should return 404', async () => {
      // When
      const response = await request(app.getHttpServer()).get(
        '/api/course/nonexistent-course-uuid',
      );
      // Then
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/course/my-history', () => {
    it('Given multiple courses, When retrieving my course history, Then should return 200 with course list', async () => {
      // Given
      const courses = Array.from({ length: 5 }, (_, i) => ({
        uuid: `test-history-course-${i + 1}`,
        course_name: `testMyCourse${i + 1}`,
        line: 'testLine',
        subway: 'testStation',
        user_uuid: testUser.uuid,
        user_name: testUser.nickname,
        count: 1,
        theme: null,
        customs: 'POPUP',
        created_at: new Date(),
      }));
      await courseRepo.save(courses);
      // When
      const response = await request(app.getHttpServer())
        .get('/api/course/my-history')
        .query({ last_id: 0, size: 5 });
      // Then
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(5);
      expect(typeof response.body.last_item_id).toBe('number');
    });
  });

  describe('GET /api/course/:uuid/place/list', () => {
    it('Given existing course, When retrieving course place list, Then should return 200 with place list', async () => {
      // Given
      await courseRepo.save({
        uuid: 'test-course-place-list-uuid',
        course_name: 'testCoursePlaceList',
        line: 'testLine',
        subway: 'testStation',
        user_uuid: testUser.uuid,
        user_name: testUser.nickname,
        count: 2,
        theme: null,
        customs: 'POPUP',
      });
      await placeRepo.save({
        uuid: 'test-place-list-uuid',
        place_name: 'testPlaceList1',
        place_type: 'POPUP',
        operation_time: '',
        closed_days: '',
        entrance_fee: '',
        thumbnail: '',
        latitude: '1.0000',
        longitude: '2.0000',
        address: 'testAddressList',
        tel: '',
        url: '',
        score: '4.0',
        kakao_rating: 0,
        review_count: 0,
        start_date: null,
        end_date: null,
        cate_name_depth1: '',
        cate_name_depth2: '',
        cate_name_depth3: '',
        brandname: '',
        mainbrand: '',
        hashtag: '',
        contents: '',
        top_level_address: '',
        subways: [],
        placeThemes: [],
        courseDetails: [],
      } as any);
      const courseDetailRepo = dataSource.getRepository(CourseDetailEntity);
      await courseDetailRepo.save({
        course_uuid: 'test-course-place-list-uuid',
        sort: 1,
        place_uuid: 'test-place-list-uuid',
        place_name: 'testPlaceList1',
        place_type: 'POPUP',
      });
      // When
      const response = await request(app.getHttpServer()).get(
        '/api/course/test-course-place-list-uuid/place/list',
      );
      // Then
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('course_uuid', 'test-course-place-list-uuid');
      expect(response.body).toHaveProperty('course_name', 'testCoursePlaceList');
      expect(Array.isArray(response.body.place)).toBe(true);
    });

    it('Given non-existing course, When retrieving course place list, Then should return 404', async () => {
      // When
      const response = await request(app.getHttpServer()).get(
        '/api/course/nonexistent-course/place/list',
      );
      // Then
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/course/recommend', () => {
    it('Given valid parameters, When retrieving recommended course, Then should return 200 with course data', async () => {
      // Given
      const dto = { station_uuid: 'test-station-uuid', theme_uuid: 'test-theme-uuid' };
      // When
      const response = await request(app.getHttpServer()).get('/api/course/recommend').query(dto);
      // Then
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('course_uuid', 'test-recommend-course-uuid');
      expect(courseRecService.getCourseRecommendation).toHaveBeenCalled();
    });
  });

  describe('GET /api/course/place/customize', () => {
    it('Given valid parameters, When retrieving customized course place, Then should return 200 with place data', async () => {
      // Given
      const dto = {
        place_uuids: 'test-place-uuid-1,test-place-uuid-2,test-place-uuid-3',
        place_type: 'SHOPPING',
        station_uuid: 'test-station-uuid',
        theme_uuid: 'test-theme-uuid',
      };
      const queryString = `place_uuids=${encodeURIComponent(dto.place_uuids)}&place_type=${
        dto.place_type
      }&station_uuid=${dto.station_uuid}&theme_uuid=${dto.theme_uuid}`;
      // When
      const response = await request(app.getHttpServer()).get(
        `/api/course/place/customize?${queryString}`,
      );
      // Then
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        sort: 1,
        uuid: 'test-custom-place-uuid',
        place_name: 'testCustomPlace',
        place_type: 'SHOPPING',
        thumbnail: 'http://example.com/test-thumbnail.jpg',
        address: 'testAddress',
        latitude: 1.2345,
        longitude: 6.789,
        score: 4.0,
        place_detail: 'testDetail',
      });
      expect(courseRecService.addCustomPlaceToCourse).toHaveBeenCalled();
    });
  });
});
