import { TestBed } from '@automock/jest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as classTransformer from 'class-transformer';
import { BookmarkQueryRepository } from 'src/bookmark/bookmark.query.repository';
import { ApiBookmarkGetDetailResponseDto } from 'src/bookmark/dto/api-bookmark-get-detail-response.dto';
import { ApiBookmarkGetRequestQueryDto } from 'src/bookmark/dto/api-bookmark-get-request-query.dto';
import { ApiBookmarkGetResponseDto } from 'src/bookmark/dto/api-bookmark-get-response.dto';
import { LastItemIdResponseDto } from 'src/commons/dtos/last-item-id-response.dto';
import { CourseQueryRepository } from 'src/course/course.query.repository';
import { BookmarkEntity } from 'src/entities/bookmark.entity';
import { UserDto } from 'src/user/dto/user.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { BookmarkService } from './bookmark.service';

describe('BookmarkService', () => {
  let bookmarkService: BookmarkService;
  let bookmarkQueryRepository: jest.Mocked<BookmarkQueryRepository>;
  let courseQueryRepository: jest.Mocked<CourseQueryRepository>;
  let userQueryRepository: jest.Mocked<UserQueryRepository>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(BookmarkService).compile();
    bookmarkService = unit;
    bookmarkQueryRepository = unitRef.get(BookmarkQueryRepository);
    courseQueryRepository = unitRef.get(CourseQueryRepository);
    userQueryRepository = unitRef.get(UserQueryRepository);
    jest.clearAllMocks();
  });

  describe('bookmarkList', () => {
    const dummyDto: ApiBookmarkGetRequestQueryDto = { size: 2 };
    const dummyUser: UserDto = { uuid: 'user-uuid' } as UserDto;

    it('should return empty response if no courses found', async () => {
      bookmarkQueryRepository.find.mockResolvedValue([]);

      // When
      const result: LastItemIdResponseDto<ApiBookmarkGetResponseDto> =
        await bookmarkService.bookmarkList(dummyDto, dummyUser);

      // Then
      expect(result).toEqual({ items: [], last_item_id: 0 });
    });

    it('should return mapped bookmark list with correct last_item_id when courses found', async () => {
      // Given
      const courseList: BookmarkEntity[] = [
        {
          id: 1,
          uuid: 'bm-1',
          user_uuid: 'user-uuid',
          course_uuid: 'course-1',
          course_name: 'Course 1',
          subway: 'Line 1',
          line: 'Line A',
          course_image: 'img1',
          user_name: 'User One',
          archived_at: null,
        },
        {
          id: 2,
          uuid: 'bm-2',
          user_uuid: 'other-uuid',
          course_uuid: 'course-2',
          course_name: 'Course 2',
          subway: 'Line 2',
          line: 'Line B',
          course_image: 'img2',
          user_name: 'User Two',
          archived_at: null,
        },
      ] as BookmarkEntity[];

      jest.spyOn(classTransformer, 'plainToInstance').mockReturnValue(courseList as any);

      bookmarkQueryRepository.find.mockResolvedValue(courseList);
      userQueryRepository.findUserList.mockResolvedValue([
        {
          id: 1,
          uuid: 'user-uuid',
          email: 'user1@example.com',
          name: 'User One',
          profile_image: 'img-user1',
          type: 'kakao',
          refresh_token: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          uuid: 'other-uuid',
          email: 'user2@example.com',
          name: 'User Two',
          profile_image: 'img-user2',
          type: 'kakao',
          refresh_token: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
      const expectedLastId = courseList[courseList.length - 1].id;

      // When
      const result = await bookmarkService.bookmarkList(dummyDto, dummyUser);

      // Then
      expect(userQueryRepository.findUserList).toHaveBeenCalledWith(
        courseList.map((item) => item.user_uuid),
      );
      expect(result.last_item_id).toEqual(expectedLastId);
      result.items.forEach((bookmark: any) => {
        const matchingUser =
          bookmark.user_uuid === 'user-uuid'
            ? { profile_image: 'img-user1' }
            : { profile_image: 'img-user2' };
        expect(bookmark.user_profile_image).toEqual(matchingUser.profile_image);
      });
    });

    it('should set last_item_id to 0 if courseList.length is less than dto.size', async () => {
      // Given
      const courseList: BookmarkEntity[] = [
        {
          id: 1,
          uuid: 'bm-1',
          user_uuid: 'user-uuid',
          course_uuid: 'course-1',
          course_name: 'Course 1',
          subway: 'Line 1',
          line: 'Line A',
          course_image: 'img1',
          user_name: 'User One',
          archived_at: null,
        },
      ] as BookmarkEntity[];

      jest.spyOn(classTransformer, 'plainToInstance').mockReturnValue(courseList as any);

      bookmarkQueryRepository.find.mockResolvedValue(courseList);
      userQueryRepository.findUserList.mockResolvedValue([
        {
          id: 1,
          uuid: 'user-uuid',
          email: 'user1@example.com',
          name: 'User One',
          profile_image: 'img-user1',
          type: 'kakao',
          refresh_token: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
      // When
      const result = await bookmarkService.bookmarkList(
        { size: 2 } as ApiBookmarkGetRequestQueryDto,
        dummyUser,
      );
      // Then
      expect(result.last_item_id).toEqual(0);
    });
  });

  describe('myCourseDetail', () => {
    const dummyUuid = 'bookmark-uuid';

    it('should throw NotFoundException when course not found', async () => {
      // Given
      bookmarkQueryRepository.findOne.mockResolvedValue(null);
      // When & Then
      await expect(bookmarkService.myCourseDetail(dummyUuid)).rejects.toThrow(NotFoundException);
    });

    it('should return course detail DTO when course found with course places', async () => {
      // Given
      const dummyCourse = {
        course_uuid: 'course-uuid',
        uuid: 'bookmark-uuid',
        course_name: 'Test Course',
        subway: 'Line 1',
      } as any;
      const dummyCoursePlaces = [
        {
          sort: 1,
          place: { name: 'Place 1', address: 'Addr 1' },
          place_uuid: 'place-1',
        },
        {
          sort: 2,
          place: { name: 'Place 2', address: 'Addr 2' },
          place_uuid: 'place-2',
        },
      ] as any;
      bookmarkQueryRepository.findOne.mockResolvedValue(dummyCourse);
      courseQueryRepository.findPlace.mockResolvedValue(dummyCoursePlaces);

      const mappedPlaces = dummyCoursePlaces.map((cp: any) => ({
        ...cp.place,
        sort: cp.sort,
        uuid: cp.place_uuid,
      }));

      jest.spyOn(classTransformer, 'plainToInstance').mockReturnValue(mappedPlaces as any);

      // When
      const result = await bookmarkService.myCourseDetail(dummyUuid);

      // Then
      expect(bookmarkQueryRepository.findOne).toHaveBeenCalledWith(dummyUuid);
      expect(courseQueryRepository.findPlace).toHaveBeenCalledWith(dummyCourse.course_uuid);
      expect(result).toBeInstanceOf(ApiBookmarkGetDetailResponseDto);
      expect(result.course_uuid).toEqual(dummyCourse.course_uuid);
      expect(result.my_course_uuid).toEqual(dummyCourse.uuid);
      expect(result.count).toEqual(dummyCoursePlaces.length);
      result.place.forEach((p: any, idx: number) => {
        expect(p.uuid).toEqual(dummyCoursePlaces[idx].place_uuid);
        expect(p.sort).toEqual(dummyCoursePlaces[idx].sort);
      });
    });

    it('should return course detail DTO with count 0 when no course places found', async () => {
      const dummyCourse = {
        course_uuid: 'course-uuid',
        uuid: 'bookmark-uuid',
        course_name: 'Test Course',
        subway: 'Line 1',
      } as any;
      bookmarkQueryRepository.findOne.mockResolvedValue(dummyCourse);
      courseQueryRepository.findPlace.mockResolvedValue([]);

      jest.spyOn(classTransformer, 'plainToInstance').mockReturnValue([]);

      // When
      const result = await bookmarkService.myCourseDetail(dummyUuid);

      // Then
      expect(result.count).toEqual(0);
      expect(result.place).toEqual([]);
    });
  });

  describe('bookmarkSave', () => {
    const dummyUser: UserDto = { uuid: 'user-uuid', nickname: 'UserName' } as UserDto;
    const courseUuid = 'course-uuid';

    it('should throw NotFoundException if course not found', async () => {
      // Given
      courseQueryRepository.findCourse.mockResolvedValue(null);
      // When & Then
      await expect(bookmarkService.bookmarkSave(dummyUser, courseUuid)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should save new bookmark if no existing bookmark found', async () => {
      // Given
      const dummyCourse = {
        subway: 'Line 1',
        line: 'L1',
        course_name: 'Test Course',
        course_image: 'img-course',
      } as any;
      courseQueryRepository.findCourse.mockResolvedValue(dummyCourse);
      bookmarkQueryRepository.findUserBookmark.mockResolvedValue(undefined);
      bookmarkQueryRepository.bookmarkSave.mockResolvedValue(undefined);

      // When
      const result = await bookmarkService.bookmarkSave(dummyUser, courseUuid);

      // Then
      expect(courseQueryRepository.findCourse).toHaveBeenCalledWith(courseUuid);
      expect(bookmarkQueryRepository.findUserBookmark).toHaveBeenCalledWith(dummyUser, courseUuid);
      expect(bookmarkQueryRepository.bookmarkSave).toHaveBeenCalled();
      expect(result).toEqual({ uuid: courseUuid });
    });

    it('should throw ConflictException if bookmark exists and not archived', async () => {
      // Given
      const dummyCourse = {
        id: 1,
        uuid: courseUuid,
        user_uuid: 'some-user-uuid',
        user_name: 'Some Name',
        subway: 'Line 1',
        line: 'L1',
        course_name: 'Test Course',
        course_image: 'img-course',
      } as any;
      courseQueryRepository.findCourse.mockResolvedValue(dummyCourse);
      bookmarkQueryRepository.findUserBookmark.mockResolvedValue({ archived_at: null } as any);

      // When & Then
      await expect(bookmarkService.bookmarkSave(dummyUser, courseUuid)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should update bookmark if bookmark exists and archived', async () => {
      // Given
      const dummyCourse = {
        id: 1,
        uuid: courseUuid,
        user_uuid: 'some-user-uuid',
        user_name: 'Some Name',
        subway: 'Line 1',
        line: 'L1',
        course_name: 'Test Course',
        course_image: 'img-course',
      } as any;
      courseQueryRepository.findCourse.mockResolvedValue(dummyCourse);
      bookmarkQueryRepository.findUserBookmark.mockResolvedValue({
        archived_at: new Date(),
      } as any);
      bookmarkQueryRepository.bookmarkUpdate.mockResolvedValue(undefined);

      // When
      const result = await bookmarkService.bookmarkSave(dummyUser, courseUuid);

      // Then
      expect(bookmarkQueryRepository.bookmarkUpdate).toHaveBeenCalled();
      expect(result).toEqual({ uuid: courseUuid });
    });
  });

  describe('bookmarkDelete', () => {
    const dummyUser: UserDto = { uuid: 'user-uuid' } as UserDto;
    const courseUuid = 'course-uuid';

    it('should throw NotFoundException if no bookmark found', async () => {
      // Given
      bookmarkQueryRepository.findUserBookmark.mockResolvedValue(null);
      // When & Then
      await expect(bookmarkService.bookmarkDelete(dummyUser, courseUuid)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete bookmark if found and return uuid', async () => {
      // Given
      const dummyBookmark = { uuid: courseUuid } as any;
      bookmarkQueryRepository.findUserBookmark.mockResolvedValue(dummyBookmark);
      bookmarkQueryRepository.bookmarkDelete.mockResolvedValue(undefined);

      // When
      const result = await bookmarkService.bookmarkDelete(dummyUser, courseUuid);

      // Then
      expect(bookmarkQueryRepository.findUserBookmark).toHaveBeenCalledWith(dummyUser, courseUuid);
      expect(bookmarkQueryRepository.bookmarkDelete).toHaveBeenCalledWith(dummyBookmark);
      expect(result).toEqual({ uuid: courseUuid });
    });
  });
});
