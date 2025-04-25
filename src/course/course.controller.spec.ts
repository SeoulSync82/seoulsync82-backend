import { TestBed } from '@automock/jest';
import { LastItemIdResponseDto } from 'src/commons/dtos/last-item-id-response.dto';
import { CourseRecommendationService } from 'src/course/course-recommendation.service';
import { CourseService } from 'src/course/course.service';
import { ApiCourseGetDetailResponseDto } from 'src/course/dto/api-course-get-detail-response.dto';
import { ApiCourseGetMyHistoryRequestQueryDto } from 'src/course/dto/api-course-get-my-history-request-query.dto';
import { ApiCourseGetMyHistoryResponseDto } from 'src/course/dto/api-course-get-my-history-response.dto';
import { ApiCourseGetPlaceCustomizeRequestQueryDto } from 'src/course/dto/api-course-get-place-customize-request-query.dto';
import { ApiCourseGetPlaceCustomizeResponseDto } from 'src/course/dto/api-course-get-place-customize-response.dto';
import { ApiCourseGetPlaceListResponseDto } from 'src/course/dto/api-course-get-place-list-response.dto';
import { ApiCourseGetRecommendRequestQueryDto } from 'src/course/dto/api-course-get-recommend-request-query.dto';
import { ApiCourseGetRecommendResponseDto } from 'src/course/dto/api-course-get-recommend-response.dto';
import { ApiCoursePostRecommendSaveRequestBodyDto } from 'src/course/dto/api-course-post-recommend-save-request-body.dto';
import { ApiCoursePostSaveResponseDto } from 'src/course/dto/api-course-post-save-response.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { CourseController } from './course.controller';

describe('CourseController', () => {
  let courseController: CourseController;
  let courseService: jest.Mocked<CourseService>;
  let courseRecommendationService: jest.Mocked<CourseRecommendationService>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(CourseController).compile();
    courseController = unit;
    courseService = unitRef.get(CourseService);
    courseRecommendationService = unitRef.get(CourseRecommendationService);
    jest.clearAllMocks();
  });

  describe('courseRecommend', () => {
    it('should return course recommendation when valid dto and user provided', async () => {
      // Given
      const dto = {
        station_uuid: 'station-uuid',
        theme_uuid: 'theme-uuid',
      } as ApiCourseGetRecommendRequestQueryDto;
      const user = { uuid: 'user-uuid', nickname: 'TestUser' } as UserDto;
      const expectedResponse: ApiCourseGetRecommendResponseDto = {
        course_uuid: 'course-uuid',
        course_name: 'Test Course',
        subway: { uuid: 'subway-uuid', station: 'StationName' },
        line: [],
        theme: { uuid: 'theme-uuid', theme: 'ThemeName' },
        places: [],
      };
      jest
        .spyOn(courseRecommendationService, 'getCourseRecommendation')
        .mockResolvedValue(expectedResponse);
      // When
      const result = await courseController.courseRecommend(dto, user);
      // Then
      expect(courseRecommendationService.getCourseRecommendation).toHaveBeenCalledWith(dto, user);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('coursePlaceCustomize', () => {
    it('should return customized course place when valid dto and user provided', async () => {
      // Given
      const dto = {
        station_uuid: 'station-uuid',
        place_type: 'CULTURE',
        place_uuids: [],
        theme_uuid: 'theme-uuid',
      } as ApiCourseGetPlaceCustomizeRequestQueryDto;
      const user = { uuid: 'user-uuid', nickname: 'TestUser' } as UserDto;
      const expectedResponse: ApiCourseGetPlaceCustomizeResponseDto = {
        uuid: 'place-uuid',
        place_name: 'Test Place',
        place_detail: 'PlaceDetail',
        place_type: 'CULTURE',
        thumbnail: 'http://example.com/image.png',
        address: 'Test Address',
        sort: 1,
        latitude: 37.1234,
        longitude: 127.1234,
        score: 4.5,
      };
      jest
        .spyOn(courseRecommendationService, 'addCustomPlaceToCourse')
        .mockResolvedValue(expectedResponse);
      // When
      const result = await courseController.coursePlaceCustomize(dto, user);
      // Then
      expect(courseRecommendationService.addCustomPlaceToCourse).toHaveBeenCalledWith(dto, user);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('courseRecommendSave', () => {
    it('should save course recommendation when valid dto and user provided', async () => {
      // Given
      const dto = {
        course_uuid: 'course-uuid',
        recommend_info: 'info',
      } as unknown as ApiCoursePostRecommendSaveRequestBodyDto;
      const user = { uuid: 'user-uuid', nickname: 'TestUser' } as UserDto;
      const expectedResponse: ApiCoursePostSaveResponseDto = {
        uuid: 'course-uuid',
      };
      jest.spyOn(courseService, 'saveCourseRecommend').mockResolvedValue(expectedResponse);
      // When
      const result = await courseController.courseRecommendSave(dto, user);
      // Then
      expect(courseService.saveCourseRecommend).toHaveBeenCalledWith(dto, user);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('myCourseRecommandHistory', () => {
    it('should return my course history when valid dto and user provided', async () => {
      // Given
      const dto = { last_id: 0, size: 5 } as ApiCourseGetMyHistoryRequestQueryDto;
      const user = { uuid: 'user-uuid', nickname: 'TestUser' } as UserDto;
      const expectedResponse: LastItemIdResponseDto<ApiCourseGetMyHistoryResponseDto> = {
        last_item_id: 123,
        items: [],
      };
      jest.spyOn(courseService, 'getMyCourseHistory').mockResolvedValue(expectedResponse);
      // When
      const result = await courseController.myCourseRecommandHistory(dto, user);
      // Then
      expect(courseService.getMyCourseHistory).toHaveBeenCalledWith(dto, user);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('courseDetail', () => {
    it('should return course detail when valid uuid and user provided', async () => {
      // Given
      const uuid = 'course-uuid';
      const user = { uuid: 'user-uuid', nickname: 'TestUser' } as UserDto;
      const expectedResponse: ApiCourseGetDetailResponseDto = {
        course_uuid: 'course-uuid',
        course_name: 'Course Name',
        subway: { uuid: 'subway-uuid', station: 'StationName' },
        line: [],
        theme: { uuid: 'theme-uuid', theme: 'ThemeName' },
        places: [],
        is_posted: false,
        is_bookmarked: false,
        created_at: new Date(),
        customs: 'restaurant',
      };
      jest.spyOn(courseService, 'getCourseDetail').mockResolvedValue(expectedResponse);
      // When
      const result = await courseController.courseDetail(uuid, user);
      // Then
      expect(courseService.getCourseDetail).toHaveBeenCalledWith(uuid, user);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('coursePlaceList', () => {
    it('should return course place list when valid uuid provided', async () => {
      // Given
      const uuid = 'course-uuid';
      const expectedResponse: ApiCourseGetPlaceListResponseDto = {
        course_uuid: 'course-uuid',
        course_name: 'Test Course',
        place: [],
      };
      jest.spyOn(courseService, 'getCoursePlaceList').mockResolvedValue(expectedResponse);
      // When
      const result = await courseController.coursePlaceList(uuid);
      // Then
      expect(courseService.getCoursePlaceList).toHaveBeenCalledWith(uuid);
      expect(result).toEqual(expectedResponse);
    });
  });
});
