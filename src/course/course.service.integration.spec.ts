import {
  ConflictException,
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarkQueryRepository } from 'src/bookmark/bookmark.query.repository';
import { CommunityQueryRepository } from 'src/community/community.query.repository';
import { CourseModule } from 'src/course/course.module';
import { CourseService } from 'src/course/course.service';
import { ApiCourseGetMyHistoryRequestQueryDto } from 'src/course/dto/api-course-get-my-history-request-query.dto';
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
import { UserQueryRepository } from 'src/user/user.query.repository';
import { DataSource, Repository } from 'typeorm';

jest.setTimeout(30000);

describe('CourseService Integration Test', () => {
  let app: INestApplication;
  let courseService: CourseService;
  let dataSource: DataSource;
  let courseRepository: Repository<CourseEntity>;
  let placeRepository: Repository<PlaceEntity>;

  let subwayQueryRepository: SubwayQueryRepository;
  let themeQueryRepository: ThemeQueryRepository;
  let userQueryRepository: UserQueryRepository;
  let bookmarkQueryRepository: BookmarkQueryRepository;
  let communityQueryRepository: CommunityQueryRepository;
  let placeQueryRepository: PlaceQueryRepository;

  const createCourseEntity = (overrides = {}): CourseEntity =>
    courseRepository.create({
      uuid: 'default-uuid',
      course_name: 'Default Course',
      line: 'Test Line',
      subway: 'Test Station',
      user_uuid: 'default-user-uuid',
      user_name: 'DefaultUser',
      count: 0,
      theme: null,
      customs: 'CULTURE',
      ...overrides,
    });

  const createUser = () => ({
    uuid: 'dummy-user-uuid',
    id: 1,
    nickname: 'TestUser',
    profile_image: 'test.png',
  });

  const setupRepositoryMocks = () => {
    jest
      .spyOn(subwayQueryRepository, 'findAllLinesForStation')
      .mockResolvedValue([{ uuid: 'subway-uuid', name: 'Test Station', line: 'Test Line' }] as any);
    jest
      .spyOn(subwayQueryRepository, 'findSubwayStationName')
      .mockResolvedValue({ uuid: 'subway-uuid', name: 'Test Station' } as any);
    jest
      .spyOn(subwayQueryRepository, 'findSubway')
      .mockResolvedValue([{ uuid: 'line-uuid', line: 'Test Line' }] as any);
    jest
      .spyOn(subwayQueryRepository, 'findSubwayStationUuid')
      .mockResolvedValue({ uuid: 'dummy-station-uuid', name: 'Test Station' } as any);

    jest
      .spyOn(themeQueryRepository, 'findThemeUuid')
      .mockResolvedValue({ uuid: 'dummy-theme-uuid', theme_name: 'Test Theme' } as any);
    jest
      .spyOn(themeQueryRepository, 'findThemeName')
      .mockResolvedValue({ uuid: 'theme-uuid', theme_name: 'Test Theme' } as any);

    jest
      .spyOn(userQueryRepository, 'findUserList')
      .mockImplementation(async (userUuids: string[]) =>
        userUuids.map((uuid) => ({ uuid, profile_image: 'test.png' } as any)),
      );

    jest.spyOn(bookmarkQueryRepository, 'findUserBookmark').mockResolvedValue(null);
    jest.spyOn(communityQueryRepository, 'findCommunityByCourse').mockResolvedValue(null);

    jest.spyOn(placeQueryRepository, 'findSubwayPlaceList').mockResolvedValue([
      { uuid: 'dummy-place-uuid-1', place_name: 'Dummy Place 1', place_type: 'CULTURE' },
      { uuid: 'dummy-place-uuid-2', place_name: 'Dummy Place 2', place_type: 'CULTURE' },
    ] as any);
    jest.spyOn(placeQueryRepository, 'findSubwayPlacesCustomizeList').mockResolvedValue([
      { uuid: 'dummy-place-uuid-1', place_name: 'Dummy Place 1', place_type: 'CULTURE' },
      { uuid: 'dummy-place-uuid-2', place_name: 'Dummy Place 2', place_type: 'CULTURE' },
    ] as any);
    jest
      .spyOn(placeQueryRepository, 'findSubwayPlacesCustomizeCultureList')
      .mockResolvedValue([
        { uuid: 'dummy-place-uuid-1', place_name: 'Dummy Place 1', place_type: 'CULTURE' },
      ] as any);
  };

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

    courseService = moduleRef.get<CourseService>(CourseService);
    dataSource = moduleRef.get<DataSource>(DataSource);
    courseRepository = dataSource.getRepository(CourseEntity);
    placeRepository = dataSource.getRepository(PlaceEntity);

    subwayQueryRepository = moduleRef.get<SubwayQueryRepository>(SubwayQueryRepository);
    themeQueryRepository = moduleRef.get<ThemeQueryRepository>(ThemeQueryRepository);
    userQueryRepository = moduleRef.get<UserQueryRepository>(UserQueryRepository);
    bookmarkQueryRepository = moduleRef.get<BookmarkQueryRepository>(BookmarkQueryRepository);
    communityQueryRepository = moduleRef.get<CommunityQueryRepository>(CommunityQueryRepository);
    placeQueryRepository = moduleRef.get<PlaceQueryRepository>(PlaceQueryRepository);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    await courseRepository.clear();
    jest.clearAllMocks();
    setupRepositoryMocks();
  });

  describe('saveCourseRecommend', () => {
    it('should save course recommendation successfully', async () => {
      // given
      const dto = {
        course_uuid: 'test-course-uuid',
        station_uuid: 'dummy-station-uuid',
        course_name: 'Integration Test Course',
        places: [
          {
            uuid: 'dummy-place-uuid-1',
            sort: 1,
            place_name: 'Dummy Place 1',
            place_type: 'CULTURE',
            thumbnail: '',
            address: '',
            latitude: '0',
            longitude: '0',
            score: '4.0',
            place_detail: 'test',
          },
          {
            uuid: 'dummy-place-uuid-2',
            sort: 2,
            place_name: 'Dummy Place 2',
            place_type: 'CULTURE',
            thumbnail: '',
            address: '',
            latitude: '0',
            longitude: '0',
            score: '4.0',
            place_detail: 'test',
          },
        ],
        theme_uuid: 'dummy-theme-uuid',
      };
      const user = createUser();

      // when
      await Promise.all(
        dto.places.map((placeDto) =>
          placeRepository.save({
            uuid: placeDto.uuid,
            place_name: placeDto.place_name,
            place_type: 'culture',
            operation_time: '',
            closed_days: '',
            entrance_fee: '',
            thumbnail: '',
            latitude: 0,
            longitude: 0,
            address: '',
            tel: '',
            url: '',
            score: 4.0,
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
          } as PlaceEntity),
        ),
      );

      // when
      const result = await courseService.saveCourseRecommend(dto, user);

      // then
      expect(result).toHaveProperty('uuid', dto.course_uuid);
      const savedCourse = await courseRepository.findOne({ where: { uuid: dto.course_uuid } });
      expect(savedCourse).toBeDefined();
      expect(savedCourse?.course_name).toEqual(dto.course_name);
    });

    it('should throw ConflictException if course already exists', async () => {
      // given
      const dto = {
        course_uuid: 'dup-course-uuid',
        station_uuid: 'dummy-station-uuid',
        course_name: 'Dup Course',
        places: [],
        theme_uuid: null,
      };
      const user = createUser();
      const courseEntity = createCourseEntity({
        uuid: dto.course_uuid,
        course_name: dto.course_name,
      });
      await courseRepository.save(courseEntity);

      // when, then
      await expect(courseService.saveCourseRecommend(dto, user)).rejects.toThrow(ConflictException);
    });
  });

  describe('getCourseDetail', () => {
    it('should return course detail successfully', async () => {
      // given
      const courseEntity = createCourseEntity({
        uuid: 'detail-course-uuid',
        course_name: 'Detail Test Course',
        count: 2,
        theme: 'Test Theme',
      });
      await courseRepository.save(courseEntity);
      const user = createUser();

      // when
      const detail = await courseService.getCourseDetail('detail-course-uuid', user);

      // then
      expect(detail).toHaveProperty('course_uuid', 'detail-course-uuid');
      expect(detail).toHaveProperty('course_name', 'Detail Test Course');
      expect(detail).toHaveProperty('subway');
      expect(detail).toHaveProperty('line');
    });

    it('should throw NotFoundException for non-existing course', async () => {
      // given
      const user = createUser();

      // when, then
      await expect(courseService.getCourseDetail('non-existent-uuid', user)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMyCourseHistory', () => {
    it('should return my course history with pagination correctly', async () => {
      // given
      const userId = 'user-history-uuid';
      const courses = [];
      for (let i = 1; i <= 5; i += 1) {
        courses.push(
          createCourseEntity({
            uuid: `my-course-${i}`,
            course_name: `My Course ${i}`,
            user_uuid: userId,
            user_name: 'HistoryUser',
            count: 1,
          }),
        );
      }
      await courseRepository.save(courses);
      const dto: ApiCourseGetMyHistoryRequestQueryDto = { last_id: 0, size: 3 };
      const userObj = { uuid: userId, id: 2, nickname: 'HistoryUser', profile_image: 'test.png' };

      // when
      const result = await courseService.getMyCourseHistory(dto, userObj);

      // then
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toEqual(3);
      expect(result.last_item_id).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getCoursePlaceList', () => {
    it('should return course place list successfully', async () => {
      // given
      const courseEntity = createCourseEntity({
        uuid: 'place-course-uuid',
        course_name: 'Place Course',
        user_uuid: 'user-place-uuid',
        user_name: 'PlaceUser',
        count: 2,
      });
      await courseRepository.save(courseEntity);

      await placeRepository.save({
        uuid: 'dummy-place-uuid',
        place_name: 'Dummy Place',
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
        score: 4.0,
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
      } as PlaceEntity);

      const courseDetailRepo = dataSource.getRepository(CourseDetailEntity);
      const courseDetail = courseDetailRepo.create({
        course_uuid: courseEntity.uuid,
        sort: 1,
        place_uuid: 'dummy-place-uuid',
        place_name: 'Dummy Place',
        place_type: 'CULTURE',
      });
      await courseDetailRepo.save(courseDetail);

      // when
      const result = await courseService.getCoursePlaceList('place-course-uuid');

      // then
      expect(result).toHaveProperty('course_uuid', 'place-course-uuid');
      expect(result).toHaveProperty('course_name', 'Place Course');
      expect(Array.isArray(result.place)).toBe(true);
    });

    it('should throw NotFoundException if course does not exist', async () => {
      // when, then
      await expect(courseService.getCoursePlaceList('non-existent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
