import { TestBed } from '@automock/jest';
import { BookmarkController } from 'src/bookmark/bookmark.controller';
import { BookmarkService } from 'src/bookmark/bookmark.service';
import { ApiBookmarkGetDetailResponseDto } from 'src/bookmark/dto/api-bookmark-get-detail-response.dto';
import { ApiBookmarkGetRequestQueryDto } from 'src/bookmark/dto/api-bookmark-get-request-query.dto';
import { ApiBookmarkGetResponseDto } from 'src/bookmark/dto/api-bookmark-get-response.dto';
import { LastItemIdResponseDto } from 'src/commons/dtos/last-item-id-response.dto';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { UserDto } from 'src/user/dto/user.dto';

describe('BookmarkController', () => {
  let bookmarkController: BookmarkController;
  let bookmarkService: jest.Mocked<BookmarkService>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(BookmarkController).compile();
    bookmarkController = unit;
    bookmarkService = unitRef.get(BookmarkService);
    jest.clearAllMocks();
  });

  describe('bookmarkList', () => {
    it('should return bookmark list when invoked', async () => {
      // Given
      const dummyQuery: ApiBookmarkGetRequestQueryDto = { size: 2 };
      const dummyUser: UserDto = { uuid: 'user-uuid' } as UserDto;
      const dummyResponse: LastItemIdResponseDto<ApiBookmarkGetResponseDto> = {
        items: [
          { user_uuid: 'user-uuid', user_profile_image: 'img-user' } as ApiBookmarkGetResponseDto,
        ],
        last_item_id: 3,
      };
      jest.spyOn(bookmarkService, 'bookmarkList').mockResolvedValue(dummyResponse);

      // When
      const result = await bookmarkController.bookmarkList(dummyQuery, dummyUser);

      // Then
      expect(bookmarkService.bookmarkList).toHaveBeenCalledWith(dummyQuery, dummyUser);
      expect(result).toEqual(dummyResponse);
    });
  });

  describe('myCourseDetail', () => {
    it('should return course detail DTO when invoked', async () => {
      // Given
      const dummyUuid = 'bookmark-uuid';
      const dummyDetail = new ApiBookmarkGetDetailResponseDto({
        course_uuid: 'course-uuid',
        my_course_uuid: dummyUuid,
        my_course_name: 'Course Name',
        subway: 'Line 1',
        count: 2,
        place: [],
      });
      jest.spyOn(bookmarkService, 'myCourseDetail').mockResolvedValue(dummyDetail);

      // When
      const result = await bookmarkController.myCourseDetail(dummyUuid);

      // Then
      expect(bookmarkService.myCourseDetail).toHaveBeenCalledWith(dummyUuid);
      expect(result).toEqual(dummyDetail);
    });
  });

  describe('bookmarkSave', () => {
    it('should save bookmark and return uuid response', async () => {
      // Given
      const courseUuid = 'course-uuid';
      const dummyUser: UserDto = { uuid: 'user-uuid', nickname: 'UserName' } as UserDto;
      const dummySave: UuidResponseDto = { uuid: courseUuid };
      jest.spyOn(bookmarkService, 'bookmarkSave').mockResolvedValue(dummySave);

      // When
      const result = await bookmarkController.bookmarkSave(dummyUser, courseUuid);

      // Then
      expect(bookmarkService.bookmarkSave).toHaveBeenCalledWith(dummyUser, courseUuid);
      expect(result).toEqual(dummySave);
    });
  });

  describe('bookmarkDelete', () => {
    it('should delete bookmark and return uuid response', async () => {
      // Given
      const courseUuid = 'course-uuid';
      const dummyUser: UserDto = { uuid: 'user-uuid' } as UserDto;
      const dummyDelete: UuidResponseDto = { uuid: courseUuid };
      jest.spyOn(bookmarkService, 'bookmarkDelete').mockResolvedValue(dummyDelete);

      // When
      const result = await bookmarkController.bookmarkDelete(dummyUser, courseUuid);

      // Then
      expect(bookmarkService.bookmarkDelete).toHaveBeenCalledWith(dummyUser, courseUuid);
      expect(result).toEqual(dummyDelete);
    });
  });
});
