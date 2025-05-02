import { TestBed } from '@automock/jest';
import { CursorPaginatedResponseDto } from 'src/commons/dtos/cursor-paginated-response.dto';
import { LastItemIdResponseDto } from 'src/commons/dtos/last-item-id-response.dto';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { CommunityService } from 'src/community/community.service';
import { ApiCommunityGetDetailResponseDto } from 'src/community/dto/api-community-get-detail-response.dto';
import { ApiCommunityGetMyCourseRequestQueryDto } from 'src/community/dto/api-community-get-my-course-request-query.dto';
import { ApiCommunityGetMyCourseResponseDto } from 'src/community/dto/api-community-get-my-course-response.dto';
import { ApiCommunityGetRequestQueryDto } from 'src/community/dto/api-community-get-request-query.dto';
import { ApiCommunityGetResponseDto } from 'src/community/dto/api-community-get-response.dto';
import { ApiCommunityPostRequestBodyDto } from 'src/community/dto/api-community-post-request-body.dto';
import { ApiCommunityPutRequestBodyDto } from 'src/community/dto/api-community-put-request-body.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { CommunityController } from './community.controller';

describe('CommunityController', () => {
  let controller: CommunityController;
  let communityService: jest.Mocked<CommunityService>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(CommunityController).compile();
    controller = unit;
    communityService = unitRef.get(CommunityService);
    jest.clearAllMocks();
  });

  describe('communityPost', () => {
    it('should call communityService.communityPost and return its result', async () => {
      // Given
      const courseUuid = 'course-uuid';
      const user = { uuid: 'user-uuid', nickname: 'UserName' } as UserDto;
      const dto: ApiCommunityPostRequestBodyDto = { review: 'Test review', score: 5 };
      const expected: UuidResponseDto = { uuid: 'generated-uuid' };
      jest.spyOn(communityService, 'communityPost').mockResolvedValue(expected);
      // When
      const result = await controller.communityPost(courseUuid, user, dto);
      // Then
      expect(communityService.communityPost).toHaveBeenCalledWith(courseUuid, user, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('communityMyCourseList', () => {
    it('should call communityService.communityMyCourseList and return its result', async () => {
      // Given
      const dto: ApiCommunityGetMyCourseRequestQueryDto = { size: 5, last_id: 0 };
      const user = { uuid: 'user-uuid', nickname: 'UserName' } as UserDto;
      const expected: LastItemIdResponseDto<ApiCommunityGetMyCourseResponseDto> = {
        items: [],
        last_item_id: 0,
      };
      jest.spyOn(communityService, 'communityMyCourseList').mockResolvedValue(expected);
      // When
      const result = await controller.communityMyCourseList(dto, user);
      // Then
      expect(communityService.communityMyCourseList).toHaveBeenCalledWith(dto, user);
      expect(result).toEqual(expected);
    });
  });

  describe('communityList', () => {
    it('should call communityService.communityList and return its result', async () => {
      // Given
      const dto: ApiCommunityGetRequestQueryDto = { size: 5 } as ApiCommunityGetRequestQueryDto;
      const user = { uuid: 'user-uuid', nickname: 'UserName' } as UserDto;
      const expected: CursorPaginatedResponseDto<ApiCommunityGetResponseDto> = {
        items: [],
        total_count: 0,
        next_page: null,
      };
      jest.spyOn(communityService, 'communityList').mockResolvedValue(expected);
      // When
      const result = await controller.communityList(dto, user);
      // Then
      expect(communityService.communityList).toHaveBeenCalledWith(dto, user);
      expect(result).toEqual(expected);
    });
  });

  describe('communityDetail', () => {
    it('should call communityService.communityDetail and return its result', async () => {
      // Given
      const communityUuid = 'community-uuid';
      const user = { uuid: 'user-uuid', nickname: 'UserName' } as UserDto;
      const expected = new ApiCommunityGetDetailResponseDto({
        uuid: communityUuid,
        course_uuid: 'course-uuid',
        user_uuid: 'user-uuid',
        user_name: 'Test User',
        user_profile_image: 'img-url',
        review: 'Test review',
        score: 5,
        is_bookmarked: false,
        course_name: 'Test Course',
        course_image: 'course-img',
        subway: 'subway',
        count: 0,
        like: 0,
        is_liked: false,
        place: [],
      });
      jest.spyOn(communityService, 'communityDetail').mockResolvedValue(expected);
      // When
      const result = await controller.communityDetail(communityUuid, user);
      // Then
      expect(communityService.communityDetail).toHaveBeenCalledWith(communityUuid, user);
      expect(result).toEqual(expected);
    });
  });

  describe('communityPut', () => {
    it('should call communityService.communityPut and return its result', async () => {
      // Given
      const communityUuid = 'community-uuid';
      const user = { uuid: 'user-uuid', nickname: 'UserName' } as UserDto;
      const dto: ApiCommunityPutRequestBodyDto = { review: 'Updated review', score: 4 };
      const expected: UuidResponseDto = { uuid: communityUuid };
      jest.spyOn(communityService, 'communityPut').mockResolvedValue(expected);
      // When
      const result = await controller.communityPut(user, dto, communityUuid);
      // Then
      expect(communityService.communityPut).toHaveBeenCalledWith(user, dto, communityUuid);
      expect(result).toEqual(expected);
    });
  });

  describe('communityDelete', () => {
    it('should call communityService.communityDelete and return its result', async () => {
      // Given
      const communityUuid = 'community-uuid';
      const user = { uuid: 'user-uuid', nickname: 'UserName' } as UserDto;
      const expected: UuidResponseDto = { uuid: communityUuid };
      jest.spyOn(communityService, 'communityDelete').mockResolvedValue(expected);
      // When
      const result = await controller.communityDelete(user, communityUuid);
      // Then
      expect(communityService.communityDelete).toHaveBeenCalledWith(user, communityUuid);
      expect(result).toEqual(expected);
    });
  });
});
