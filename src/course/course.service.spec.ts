import { TestBed } from '@automock/jest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { blancLogger } from 'blanc-logger';
import { BookmarkQueryRepository } from 'src/bookmark/bookmark.query.repository';
import { CommunityQueryRepository } from 'src/community/community.query.repository';
import { CourseQueryRepository } from 'src/course/course.query.repository';
import { ApiCourseGetDetailResponseDto } from 'src/course/dto/api-course-get-detail-response.dto';
import { ApiCourseGetMyHistoryRequestQueryDto } from 'src/course/dto/api-course-get-my-history-request-query.dto';
import { ApiCourseGetPlaceListResponseDto } from 'src/course/dto/api-course-get-place-list-response.dto';
import { ApiCoursePostRecommendSaveRequestBodyDto } from 'src/course/dto/api-course-post-recommend-save-request-body.dto';
import { CoursePlaceDetailRequestDto } from 'src/course/dto/course-place-detail-request.dto';
import { CourseEntity } from 'src/entities/course.entity';
import { SubwayQueryRepository } from 'src/subway/subway.query.repository';
import { ThemeQueryRepository } from 'src/theme/theme.query.repository';
import { UserDto } from 'src/user/dto/user.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { DataSource, QueryRunner } from 'typeorm';
import { CourseService } from './course.service';

describe('CourseService', () => {
  let courseService: CourseService;
  let courseQueryRepository: jest.Mocked<CourseQueryRepository>;
  let subwayQueryRepository: jest.Mocked<SubwayQueryRepository>;
  let userQueryRepository: jest.Mocked<UserQueryRepository>;
  let bookmarkQueryRepository: jest.Mocked<BookmarkQueryRepository>;
  let communityQueryRepository: jest.Mocked<CommunityQueryRepository>;
  let themeQueryRepository: jest.Mocked<ThemeQueryRepository>;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(CourseService).compile();
    courseService = unit;
    courseQueryRepository = unitRef.get(CourseQueryRepository);
    subwayQueryRepository = unitRef.get(SubwayQueryRepository);
    userQueryRepository = unitRef.get(UserQueryRepository);
    bookmarkQueryRepository = unitRef.get(BookmarkQueryRepository);
    communityQueryRepository = unitRef.get(CommunityQueryRepository);
    themeQueryRepository = unitRef.get(ThemeQueryRepository);
    dataSource = unitRef.get(DataSource);
    jest.clearAllMocks();
  });

  describe('saveCourseRecommend', () => {
    const fullDto: ApiCoursePostRecommendSaveRequestBodyDto = {
      course_uuid: 'course-uuid',
      station_uuid: 'station-uuid',
      theme_uuid: 'theme-uuid',
      course_name: 'Test Course',
      places: [
        { uuid: 'place-1', place_name: 'Place 1', place_type: 'TYPE1', sort: 1 },
        { uuid: 'place-2', place_name: 'Place 2', place_type: 'TYPE2', sort: 2 },
      ] as CoursePlaceDetailRequestDto[],
    };
    const guestDto: ApiCoursePostRecommendSaveRequestBodyDto = {
      course_uuid: 'course-uuid',
      station_uuid: 'station-uuid',
      course_name: 'Test Course',
      places: [
        { uuid: 'place-1', place_name: 'Place 1', place_type: 'TYPE1', sort: 1 },
      ] as CoursePlaceDetailRequestDto[],
    };
    const user: UserDto = { uuid: 'user-uuid', nickname: 'UserName' } as UserDto;

    it('should throw ConflictException when course already exists', async () => {
      // Given
      courseQueryRepository.findCourse.mockResolvedValue({
        uuid: 'existing-course',
      } as CourseEntity);
      // When & Then
      await expect(courseService.saveCourseRecommend(fullDto, user)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException when subway lines are not found', async () => {
      // Given
      courseQueryRepository.findCourse.mockResolvedValue(null);
      subwayQueryRepository.findAllLinesForStation.mockResolvedValue([]);
      // When & Then
      await expect(courseService.saveCourseRecommend(fullDto, user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should successfully save course recommendation with theme and return response dto', async () => {
      // Given
      courseQueryRepository.findCourse.mockResolvedValue(null);
      subwayQueryRepository.findAllLinesForStation.mockResolvedValue([
        {
          id: 1,
          uuid: 'line-1',
          name: 'Station A',
          line: 'Line 1',
          line_uuid: 'line-uuid',
          latitude: 0,
          longitude: 0,
        },
      ]);
      themeQueryRepository.findThemeUuid.mockResolvedValue({
        id: 1,
        uuid: 'theme-uuid',
        theme_name: 'Theme1',
      });

      const fakeQueryRunner = {
        connect: jest.fn().mockResolvedValue(undefined),
        startTransaction: jest.fn().mockResolvedValue(undefined),
        manager: {
          save: jest.fn().mockResolvedValue(undefined),
        },
        commitTransaction: jest.fn().mockResolvedValue(undefined),
        rollbackTransaction: jest.fn().mockResolvedValue(undefined),
        release: jest.fn().mockResolvedValue(undefined),
      } as unknown as QueryRunner;

      jest.spyOn(dataSource, 'createQueryRunner').mockReturnValue(fakeQueryRunner);
      // When
      const result = await courseService.saveCourseRecommend(fullDto, user);
      // Then
      expect(fakeQueryRunner.connect).toHaveBeenCalled();
      expect(fakeQueryRunner.startTransaction).toHaveBeenCalled();
      expect(fakeQueryRunner.manager.save).toHaveBeenCalledTimes(2);
      expect(fakeQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual({ uuid: fullDto.course_uuid });
    });

    it('should successfully save course recommendation with no theme and guest user when user is null', async () => {
      // Given
      courseQueryRepository.findCourse.mockResolvedValue(null);
      subwayQueryRepository.findAllLinesForStation.mockResolvedValue([
        {
          id: 1,
          uuid: 'line-1',
          name: 'Station A',
          line: 'Line 1',
          line_uuid: 'line-uuid',
          latitude: 0,
          longitude: 0,
        },
      ]);

      const fakeQueryRunner = {
        connect: jest.fn().mockResolvedValue(undefined),
        startTransaction: jest.fn().mockResolvedValue(undefined),
        manager: {
          save: jest.fn().mockResolvedValue(undefined),
        },
        commitTransaction: jest.fn().mockResolvedValue(undefined),
        rollbackTransaction: jest.fn().mockResolvedValue(undefined),
        release: jest.fn().mockResolvedValue(undefined),
      } as unknown as QueryRunner;
      jest.spyOn(dataSource, 'createQueryRunner').mockReturnValue(fakeQueryRunner);
      // When
      const result = await courseService.saveCourseRecommend(guestDto, null);
      // Then
      expect(result).toEqual({ uuid: guestDto.course_uuid });
    });

    it('should rollback transaction and rethrow error when an error occurs during saving', async () => {
      // Given
      courseQueryRepository.findCourse.mockResolvedValue(null);
      subwayQueryRepository.findAllLinesForStation.mockResolvedValue([
        {
          id: 1,
          uuid: 'line-1',
          name: 'Station A',
          line: 'Line 1',
          line_uuid: 'line-uuid',
          latitude: 0,
          longitude: 0,
        },
      ]);
      themeQueryRepository.findThemeUuid.mockResolvedValue({
        id: 1,
        uuid: 'theme-uuid',
        theme_name: 'Theme1',
      });

      const fakeError = new Error('Test error');
      const fakeQueryRunner = {
        connect: jest.fn().mockResolvedValue(undefined),
        startTransaction: jest.fn().mockResolvedValue(undefined),
        manager: {
          save: jest.fn().mockRejectedValueOnce(fakeError),
        },
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn().mockResolvedValue(undefined),
        release: jest.fn().mockResolvedValue(undefined),
      } as unknown as QueryRunner;

      jest.spyOn(dataSource, 'createQueryRunner').mockReturnValue(fakeQueryRunner);
      const loggerSpy = jest.spyOn(blancLogger, 'error').mockImplementation(() => {});
      // When & Then
      await expect(courseService.saveCourseRecommend(fullDto, user)).rejects.toThrow(fakeError);
      expect(fakeQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('Error in saveCourseRecommend', {
        moduleName: 'CourseService',
      });
    });
  });

  describe('getCourseDetail', () => {
    it('should throw NotFoundException when course is not found', async () => {
      // Given
      courseQueryRepository.findOne.mockResolvedValue(null);
      // When & Then
      await expect(
        courseService.getCourseDetail('course-uuid', { uuid: 'user-uuid' } as UserDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should use default guest user when user is empty', async () => {
      // Given
      const defaultUser = { uuid: '', id: null, nickname: null, profile_image: null };
      const course: CourseEntity = {
        uuid: 'course-uuid',
        course_name: 'Test Course',
        subway: 'subway-uuid',
        theme: 'theme-uuid',
        created_at: new Date(),
      } as CourseEntity;
      const bookmark = [];
      const community = null;
      const coursePlaces = [];

      courseQueryRepository.findOne.mockResolvedValue(course);
      bookmarkQueryRepository.findUserBookmark.mockResolvedValue(bookmark as any);
      communityQueryRepository.findCommunityByCourse.mockResolvedValue(community as any);
      courseQueryRepository.findPlace.mockResolvedValue(coursePlaces as any);
      subwayQueryRepository.findSubwayStationName.mockResolvedValue({
        id: 1,
        uuid: 'station-uuid',
        name: 'Station A',
        line: 'Line 1',
        line_uuid: 'line-uuid',
        latitude: 0,
        longitude: 0,
      });
      subwayQueryRepository.findSubway.mockResolvedValue([
        {
          id: 1,
          uuid: 'station-uuid',
          name: 'Station A',
          line: 'Line 1',
          line_uuid: 'line-uuid',
          latitude: 0,
          longitude: 0,
        },
      ]);
      themeQueryRepository.findThemeName.mockResolvedValue({
        id: 1,
        uuid: 'theme-uuid',
        theme_name: 'Theme1',
      });

      // When
      await courseService.getCourseDetail('course-uuid', null as any);

      // Then
      expect(bookmarkQueryRepository.findUserBookmark).toHaveBeenCalledWith(
        defaultUser,
        'course-uuid',
      );
      expect(communityQueryRepository.findCommunityByCourse).toHaveBeenCalledWith(
        'course-uuid',
        defaultUser,
      );
    });

    it('should return course detail response dto with theme when course.theme is provided', async () => {
      // Given
      const course: CourseEntity = {
        uuid: 'course-uuid',
        course_name: 'Test Course',
        subway: 'subway-uuid',
        theme: 'theme-uuid',
        created_at: new Date(),
      } as CourseEntity;
      const bookmark = [{ user_uuid: 'user-uuid' }];
      const community = { uuid: 'community-uuid' };
      const coursePlaces = [
        {
          sort: 1,
          place_uuid: 'place-1',
          place: { uuid: 'place-1', place_name: 'Place 1', place_type: 'TYPE1' },
        },
      ];
      courseQueryRepository.findOne.mockResolvedValue(course);
      bookmarkQueryRepository.findUserBookmark.mockResolvedValue(bookmark as any);
      communityQueryRepository.findCommunityByCourse.mockResolvedValue(community as any);
      courseQueryRepository.findPlace.mockResolvedValue(coursePlaces as any);
      subwayQueryRepository.findSubwayStationName.mockResolvedValue({
        id: 1,
        uuid: 'station-uuid',
        name: 'Station A',
        line: 'Line 1',
        line_uuid: 'line-uuid',
        latitude: 0,
        longitude: 0,
      });
      subwayQueryRepository.findSubway.mockResolvedValue([
        {
          id: 1,
          uuid: 'line-1',
          name: 'Station A',
          line: 'Line 1',
          line_uuid: 'line-uuid',
          latitude: 0,
          longitude: 0,
        },
      ]);
      themeQueryRepository.findThemeName.mockResolvedValue({
        id: 1,
        uuid: 'theme-uuid',
        theme_name: 'Theme1',
      });
      // When
      const result = await courseService.getCourseDetail('course-uuid', {
        uuid: 'user-uuid',
      } as UserDto);
      // Then
      expect(result).toBeInstanceOf(ApiCourseGetDetailResponseDto);
      expect(result.course_name).toBe('Test Course');
      expect(result.subway.station).toBe('Station A');
      expect(result.theme).toEqual({ uuid: 'theme-uuid', theme: 'Theme1' });
    });

    it('should return course detail response dto with undefined theme when course.theme is falsy', async () => {
      // Given
      const course: CourseEntity = {
        uuid: 'course-uuid',
        course_name: 'Test Course',
        subway: 'subway-uuid',
        theme: '',
        created_at: new Date(),
      } as CourseEntity;
      const bookmark = [];
      const community = null;
      const coursePlaces = [
        {
          sort: 1,
          place_uuid: 'place-1',
          place: { uuid: 'place-1', place_name: 'Place 1', place_type: 'TYPE1' },
        },
      ];
      courseQueryRepository.findOne.mockResolvedValue(course);
      bookmarkQueryRepository.findUserBookmark.mockResolvedValue(bookmark as any);
      communityQueryRepository.findCommunityByCourse.mockResolvedValue(community as any);
      courseQueryRepository.findPlace.mockResolvedValue(coursePlaces as any);
      subwayQueryRepository.findSubwayStationName.mockResolvedValue({
        id: 1,
        uuid: 'line-1',
        name: 'Station A',
        line: 'Line 1',
        line_uuid: 'line-uuid',
        latitude: 0,
        longitude: 0,
      });
      subwayQueryRepository.findSubway.mockResolvedValue([
        {
          id: 1,
          uuid: 'line-1',
          name: 'Station A',
          line: 'Line 1',
          line_uuid: 'line-uuid',
          latitude: 0,
          longitude: 0,
        },
      ]);
      // When
      const result = await courseService.getCourseDetail('course-uuid', {
        uuid: 'user-uuid',
      } as UserDto);
      // Then
      expect(result).toBeInstanceOf(ApiCourseGetDetailResponseDto);
      expect(result.theme).toBeUndefined();
    });
  });

  describe('getMyCourseHistory', () => {
    const dto: ApiCourseGetMyHistoryRequestQueryDto = { size: 2, last_id: 0 };
    const user: UserDto = { uuid: 'user-uuid' } as UserDto;

    it('should return empty history when no courses found', async () => {
      // Given
      courseQueryRepository.findMyCourse.mockResolvedValue([]);
      // When
      const result = await courseService.getMyCourseHistory(dto, user);
      // Then
      expect(result).toEqual({ items: [], last_item_id: 0 });
    });

    it('should return my course history with correct last_item_id when courseList length equals dto.size', async () => {
      // Given
      const courseList = [
        {
          id: 1,
          uuid: 'course-1',
          course_name: 'Course 1',
          user_uuid: 'user-uuid',
          created_at: new Date(),
        },
        {
          id: 2,
          uuid: 'course-2',
          course_name: 'Course 2',
          user_uuid: 'user-uuid',
          created_at: new Date(),
        },
      ] as CourseEntity[];
      courseQueryRepository.findMyCourse.mockResolvedValue(courseList);
      userQueryRepository.findUserList.mockResolvedValue([
        {
          id: 1,
          uuid: 'user-uuid',
          profile_image: 'img-user',
          email: '',
          type: '',
          refresh_token: null,
          created_at: new Date(),
          updated_at: new Date(),
          name: 'UserName',
        },
      ] as any);
      // When
      const result = await courseService.getMyCourseHistory(dto, user);
      // Then
      const expectedLastItemId = courseList[courseList.length - 1].id;
      expect(result.last_item_id).toBe(expectedLastItemId);
      expect(result.items.length).toBe(courseList.length);
    });

    it('should map is_posted, score and like_count when community exists', async () => {
      // Given
      const apiCourseGetMyHistoryRequestQueryDto = {
        size: 1,
        last_id: 0,
      } as ApiCourseGetMyHistoryRequestQueryDto;
      const userDto = { uuid: 'user-uuid' } as UserDto;
      const courseList = [
        {
          id: 1,
          uuid: 'course-1',
          course_name: 'Course 1',
          user_uuid: 'user-uuid',
          created_at: new Date(),
        },
      ] as CourseEntity[];
      courseQueryRepository.findMyCourse.mockResolvedValue(courseList);
      userQueryRepository.findUserList.mockResolvedValue([
        { uuid: 'user-uuid', profile_image: 'url-profile' },
      ] as any);
      communityQueryRepository.findExistingCourse.mockResolvedValue([
        { course_uuid: 'course-1', score: '4.5', like_count: 10 },
      ] as any);

      // When
      const result = await courseService.getMyCourseHistory(
        apiCourseGetMyHistoryRequestQueryDto,
        userDto,
      );

      // Then
      expect(result.items[0].is_posted).toBe(true);
      expect(result.items[0].score).toBe('4.5');
      expect(result.items[0].like_count).toBe(10);
    });

    it('should default score "0.0" and like_count 0 when no community exists', async () => {
      // Given
      const apiCourseGetMyHistoryRequestQueryDto = {
        size: 1,
        last_id: 0,
      } as ApiCourseGetMyHistoryRequestQueryDto;
      const userDto = { uuid: 'user-uuid' } as UserDto;
      const courseList = [
        {
          id: 1,
          uuid: 'course-2',
          course_name: 'Course 2',
          user_uuid: 'user-uuid',
          created_at: new Date(),
        },
      ] as CourseEntity[];
      courseQueryRepository.findMyCourse.mockResolvedValue(courseList);
      userQueryRepository.findUserList.mockResolvedValue([
        { uuid: 'user-uuid', profile_image: 'url-profile' },
      ] as any);
      communityQueryRepository.findExistingCourse.mockResolvedValue([] as any);

      // When
      const result = await courseService.getMyCourseHistory(
        apiCourseGetMyHistoryRequestQueryDto,
        userDto,
      );

      // Then
      expect(result.items[0].is_posted).toBe(false);
      expect(result.items[0].score).toBe('0.0');
      expect(result.items[0].like_count).toBe(0);
    });

    it('should return my course history with last_item_id as 0 when courseList length is less than dto.size', async () => {
      // Given
      const dtoExtended: ApiCourseGetMyHistoryRequestQueryDto = { size: 3, last_id: 0 };
      const courseList = [
        {
          id: 1,
          uuid: 'course-1',
          course_name: 'Course 1',
          user_uuid: 'user-uuid',
          created_at: new Date(),
        },
        {
          id: 2,
          uuid: 'course-2',
          course_name: 'Course 2',
          user_uuid: 'user-uuid',
          created_at: new Date(),
        },
      ] as CourseEntity[];
      courseQueryRepository.findMyCourse.mockResolvedValue(courseList);
      userQueryRepository.findUserList.mockResolvedValue([
        {
          id: 1,
          uuid: 'user-uuid',
          profile_image: 'img-user',
          email: '',
          type: '',
          refresh_token: null,
          created_at: new Date(),
          updated_at: new Date(),
          name: 'UserName',
        },
      ] as any);
      // When
      const result = await courseService.getMyCourseHistory(dtoExtended, user);
      // Then
      expect(result.last_item_id).toBe(0);
      expect(result.items.length).toBe(courseList.length);
    });
  });

  describe('getCoursePlaceList', () => {
    it('should throw NotFoundException when course is not found', async () => {
      // Given
      courseQueryRepository.findOne.mockResolvedValue(null);
      // When & Then
      await expect(courseService.getCoursePlaceList('course-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return course place list response dto', async () => {
      // Given
      const course: CourseEntity = {
        uuid: 'course-uuid',
        course_name: 'Test Course',
      } as CourseEntity;
      const coursePlaces = [
        {
          sort: 1,
          place_uuid: 'place-1',
          place: { uuid: 'place-1', place_name: 'Place 1' },
        },
      ];
      courseQueryRepository.findOne.mockResolvedValue(course);
      courseQueryRepository.findPlace.mockResolvedValue(coursePlaces as any);
      // When
      const result = await courseService.getCoursePlaceList('course-uuid');
      // Then
      expect(result).toBeInstanceOf(ApiCourseGetPlaceListResponseDto);
      expect(result.course_uuid).toBe('course-uuid');
      expect(result.course_name).toBe('Test Course');
      expect(result.place.length).toBe(1);
    });
  });
});
