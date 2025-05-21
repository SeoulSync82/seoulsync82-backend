import { TestBed } from '@automock/jest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BookmarkQueryRepository } from 'src/bookmark/bookmark.query.repository';
import { CommentQueryRepository } from 'src/comment/comment.query.repository';
import * as generateUUID from 'src/commons/util/uuid';
import { CommunityQueryRepository } from 'src/community/community.query.repository';
import { ApiCommunityGetDetailResponseDto } from 'src/community/dto/api-community-get-detail-response.dto';
import { ApiCommunityGetMyCourseRequestQueryDto } from 'src/community/dto/api-community-get-my-course-request-query.dto';
import { ApiCommunityGetRequestQueryDto } from 'src/community/dto/api-community-get-request-query.dto';
import { ApiCommunityPostRequestBodyDto } from 'src/community/dto/api-community-post-request-body.dto';
import { ApiCommunityPutRequestBodyDto } from 'src/community/dto/api-community-put-request-body.dto';
import { CourseQueryRepository } from 'src/course/course.query.repository';
import { CommentEntity } from 'src/entities/comment.entity';
import { CommunityEntity } from 'src/entities/community.entity';
import { CourseEntity } from 'src/entities/course.entity';
import { ReactionQueryRepository } from 'src/reaction/reaction.query.repository';
import { UserDto } from 'src/user/dto/user.dto';
import { UserQueryRepository } from 'src/user/user.query.repository';
import { CommunityService } from './community.service';

describe('CommunityService', () => {
  let communityService: CommunityService;
  let communityQueryRepository: jest.Mocked<CommunityQueryRepository>;
  let bookmarkQueryRepository: jest.Mocked<BookmarkQueryRepository>;
  let courseQueryRepository: jest.Mocked<CourseQueryRepository>;
  let reactionQueryRepository: jest.Mocked<ReactionQueryRepository>;
  let userQueryRepository: jest.Mocked<UserQueryRepository>;
  let commentQueryRepository: jest.Mocked<CommentQueryRepository>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(CommunityService).compile();
    communityService = unit;
    communityQueryRepository = unitRef.get(CommunityQueryRepository);
    bookmarkQueryRepository = unitRef.get(BookmarkQueryRepository);
    courseQueryRepository = unitRef.get(CourseQueryRepository);
    reactionQueryRepository = unitRef.get(ReactionQueryRepository);
    userQueryRepository = unitRef.get(UserQueryRepository);
    commentQueryRepository = unitRef.get(CommentQueryRepository);
    jest.clearAllMocks();
  });

  describe('communityPost', () => {
    it('should throw NotFoundException when course not found', async () => {
      // Given
      const courseUuid = 'course-uuid';
      const user = { uuid: 'user-uuid', nickname: 'UserName' } as UserDto;
      const dto: ApiCommunityPostRequestBodyDto = { review: 'Great review', score: 5 };
      courseQueryRepository.findOne.mockResolvedValue(null);
      // When & Then
      await expect(communityService.communityPost(courseUuid, user, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when community already exists', async () => {
      // Given
      const courseUuid = 'course-uuid';
      const user = { uuid: 'user-uuid', nickname: 'UserName' } as UserDto;
      const dto: ApiCommunityPostRequestBodyDto = { review: 'Great review', score: 5 };
      const course = { course_name: 'Test Course' } as CourseEntity;
      courseQueryRepository.findOne.mockResolvedValue(course);
      communityQueryRepository.findCommunityByCourse.mockResolvedValue({
        uuid: 'existing-community',
      } as CommunityEntity);
      // When & Then
      await expect(communityService.communityPost(courseUuid, user, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create community and return UuidResponseDto', async () => {
      // Given
      const courseUuid = 'course-uuid';
      const user = { uuid: 'user-uuid', nickname: 'UserName' } as UserDto;
      const dto: ApiCommunityPostRequestBodyDto = { review: 'Great review', score: 5 };
      const course = { course_name: 'Test Course' } as CourseEntity;
      courseQueryRepository.findOne.mockResolvedValue(course);
      communityQueryRepository.findCommunityByCourse.mockResolvedValue(null);
      const generatedUUID = 'generated-uuid';
      jest.spyOn(generateUUID, 'generateUUID').mockReturnValue(generatedUUID);
      communityQueryRepository.save.mockResolvedValue({ uuid: generatedUUID } as CommunityEntity);
      // When
      const result = await communityService.communityPost(courseUuid, user, dto);
      // Then
      expect(courseQueryRepository.findOne).toHaveBeenCalledWith(courseUuid);
      expect(communityQueryRepository.findCommunityByCourse).toHaveBeenCalledWith(courseUuid, user);
      expect(communityQueryRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ uuid: generatedUUID });
    });
  });

  describe('communityMyCourseList', () => {
    it('should return empty list when no courses found', async () => {
      // Given
      const dto: ApiCommunityGetMyCourseRequestQueryDto = { size: 5, last_id: 0 };
      const user = { uuid: 'user-uuid' } as UserDto;
      courseQueryRepository.findMyCourse.mockResolvedValue([]);
      // When
      const result = await communityService.communityMyCourseList(dto, user);
      // Then
      expect(result).toEqual({ items: [], last_item_id: 0 });
    });

    it('should return list of courses with is_posted flag and correct last_item_id when myCourses.length equals dto.size', async () => {
      // Given
      const dto: ApiCommunityGetMyCourseRequestQueryDto = { size: 2, last_id: 0 };
      const user = { uuid: 'user-uuid' } as UserDto;
      const myCourses: CourseEntity[] = [
        {
          id: 1,
          uuid: 'course-1',
          course_name: 'Course 1',
          course_image: '',
          subway: '',
          line: '',
          customs: '',
          created_at: new Date(),
        },
        {
          id: 2,
          uuid: 'course-2',
          course_name: 'Course 2',
          course_image: '',
          subway: '',
          line: '',
          customs: '',
          created_at: new Date(),
        },
      ] as CourseEntity[];
      const myCommunity: CommunityEntity[] = [{ course_uuid: 'course-1' } as CommunityEntity];
      courseQueryRepository.findMyCourse.mockResolvedValue(myCourses);
      communityQueryRepository.myCommunity.mockResolvedValue(myCommunity);
      // When
      const result = await communityService.communityMyCourseList(dto, user);
      // Then
      const expectedLastItemId =
        myCourses.length === dto.size ? myCourses[myCourses.length - 1].id : 0;
      expect(result.last_item_id).toBe(expectedLastItemId);
      expect(result.items).toHaveLength(myCourses.length);
      expect(result.items[0].is_posted).toBe(true);
      expect(result.items[1].is_posted).toBe(false);
    });

    it('should return last_item_id as 0 when myCourses.length is less than dto.size', async () => {
      // Given
      const dto: ApiCommunityGetMyCourseRequestQueryDto = { size: 3, last_id: 0 };
      const user = { uuid: 'user-uuid' } as UserDto;
      const myCourses: CourseEntity[] = [
        {
          id: 1,
          uuid: 'course-1',
          course_name: 'Course 1',
          course_image: '',
          subway: '',
          line: '',
          customs: '',
          created_at: new Date(),
        },
        {
          id: 2,
          uuid: 'course-2',
          course_name: 'Course 2',
          course_image: '',
          subway: '',
          line: '',
          customs: '',
          created_at: new Date(),
        },
      ] as CourseEntity[];
      const myCommunity: CommunityEntity[] = [{ course_uuid: 'course-1' } as CommunityEntity];
      courseQueryRepository.findMyCourse.mockResolvedValue(myCourses);
      communityQueryRepository.myCommunity.mockResolvedValue(myCommunity);
      // When
      const result = await communityService.communityMyCourseList(dto, user);
      // Then
      expect(result.last_item_id).toBe(0);
      expect(result.items).toHaveLength(myCourses.length);
    });
  });

  describe('communityList', () => {
    it('should return empty list when totalCount is empty', async () => {
      // Given
      const dto: ApiCommunityGetRequestQueryDto = { size: 5 } as ApiCommunityGetRequestQueryDto;
      const user = { uuid: 'user-uuid' } as UserDto;
      communityQueryRepository.countTotalCommunity.mockResolvedValue(0);
      communityQueryRepository.findCommunityList.mockResolvedValue({
        communityList: [],
        nextCursor: null,
      });
      // When
      const result = await communityService.communityList(dto, user);
      // Then
      expect(result).toEqual({ items: [], total_count: 0, next_page: null });
    });

    it('should return community list with mapped course and user info', async () => {
      // Given
      const dto: ApiCommunityGetRequestQueryDto = { size: 5 } as ApiCommunityGetRequestQueryDto;
      const user = { uuid: 'user-uuid' } as UserDto;
      const totalCount = 2;
      const communityList: CommunityEntity[] = [
        {
          uuid: 'comm-1',
          course_uuid: 'course-1',
          user_uuid: 'user-1',
          review: 'Nice',
          score: 5,
          course_name: 'Course 1',
        } as CommunityEntity,
        {
          uuid: 'comm-2',
          course_uuid: 'course-2',
          user_uuid: 'user-2',
          review: 'Good',
          score: 4,
          course_name: 'Course 2',
        } as CommunityEntity,
      ];
      const nextCursor = 'next-cursor';
      communityQueryRepository.countTotalCommunity.mockResolvedValue(totalCount);
      communityQueryRepository.findCommunityList.mockResolvedValue({ communityList, nextCursor });
      const courseList: CourseEntity[] = [
        {
          id: 1,
          uuid: 'course-1',
          course_name: 'Course 1',
          customs: 'custom-1',
          line: 'line-1',
          subway: 'subway-1',
          course_image: 'img-1',
          created_at: new Date(),
        },
        {
          id: 2,
          uuid: 'course-2',
          course_name: 'Course 2',
          customs: 'custom-2',
          line: 'line-2',
          subway: 'subway-2',
          course_image: 'img-2',
          created_at: new Date(),
        },
      ] as CourseEntity[];
      const userList = [
        {
          id: 1,
          uuid: 'user-1',
          email: 'u1@example.com',
          name: 'User One',
          profile_image: 'img-u1',
          type: 'dummy',
          refresh_token: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          uuid: 'user-2',
          email: 'u2@example.com',
          name: 'User Two',
          profile_image: 'img-u2',
          type: 'dummy',
          refresh_token: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      courseQueryRepository.findList.mockResolvedValue(courseList);
      userQueryRepository.findUserList.mockResolvedValue(userList as any);
      // When
      const result = await communityService.communityList(dto, user);
      // Then
      expect(result.total_count).toBe(totalCount);
      expect(result.next_page).toBe(nextCursor);
      expect(result.items).toHaveLength(communityList.length);
      const mappedFirst = result.items[0];
      expect(mappedFirst.customs).toBe('custom-1');
      expect(mappedFirst.line).toBe('line-1');
      expect(mappedFirst.subway).toBe('subway-1');
      expect(mappedFirst.course_image).toBe('img-1');
      expect(mappedFirst.user_name).toBe('User One');
      expect(mappedFirst.user_profile_image).toBe('img-u1');
    });
  });

  describe('communityDetail', () => {
    it('should throw NotFoundException when community not found', async () => {
      // Given
      const commUuid = 'comm-uuid';
      const user = { uuid: 'user-uuid' } as UserDto;
      communityQueryRepository.findOne.mockResolvedValue(null);
      // When & Then
      await expect(communityService.communityDetail(commUuid, user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return community detail response dto', async () => {
      // Given
      const commUuid = 'comm-uuid';
      const user = { uuid: 'user-uuid', nickname: 'UserName' } as UserDto;
      const community: CommunityEntity = {
        uuid: commUuid,
        course_uuid: 'course-uuid',
        user_uuid: 'comm-user-uuid',
        review: 'Great review',
        score: 5,
        course_name: 'Course Name',
      } as CommunityEntity;
      communityQueryRepository.findOne.mockResolvedValue(community);
      const bookmark = [
        {
          id: 1,
          uuid: 'bookmark-1',
          course_uuid: 'course-uuid',
          user_uuid: 'user-uuid',
          subway: 'subway',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      const course = {
        id: 1,
        uuid: 'course-uuid',
        course_name: 'Course Name',
        course_image: 'img-course',
        subway: 'subway',
        line: 'line',
        customs: 'customs',
        created_at: new Date(),
      } as CourseEntity;
      const coursePlaces = [
        {
          id: 1,
          course_uuid: 'course-uuid',
          place_name: 'Place 1',
          place_type: 'type',
          place: { some: 'data' },
          sort: 1,
          place_uuid: 'place-uuid',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      const reactions = [
        {
          id: 1,
          uuid: 'r-uuid',
          target_uuid: commUuid,
          user_uuid: 'other-uuid',
          user_name: 'Other',
          like: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      const communityUser = {
        id: 3,
        uuid: 'comm-user-uuid',
        email: 'comm@example.com',
        name: 'Community User',
        profile_image: 'img-user',
        type: 'dummy',
        refresh_token: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const comment = {
        id: 1,
        uuid: 'comment-1',
        user_uuid: 'user-uuid',
        comment: 'Only comment',
      };

      bookmarkQueryRepository.findMyCourse.mockResolvedValue(bookmark as any);
      courseQueryRepository.findOne.mockResolvedValue(course);
      courseQueryRepository.findPlace.mockResolvedValue(coursePlaces as any);
      reactionQueryRepository.findCommunityDetailReaction.mockResolvedValue(reactions as any);
      userQueryRepository.findOne.mockResolvedValue(communityUser as any);
      commentQueryRepository.findMyComment.mockResolvedValue(comment as CommentEntity);
      // When
      const result = await communityService.communityDetail(commUuid, user);
      // Then
      expect(result).toBeInstanceOf(ApiCommunityGetDetailResponseDto);
      expect(result.uuid).toBe(commUuid);
      expect(result.is_bookmarked).toBe(true);
      expect(result.is_commented).toBe(true);
      expect(result.course_image).toBe('img-course');
      expect(result.subway).toBe('subway');
      expect(result.count).toBe(coursePlaces.length);
      expect(result.like).toBe(reactions.length);
      expect(result.is_liked).toBe(false);
    });

    it('should set is_commented as false when no comment and user is not author', async () => {
      // Given
      const commUuid = 'comm-uuid';
      const user = { uuid: 'user-uuid' } as UserDto;
      const communityUser = {
        id: 3,
        uuid: 'comm-user-uuid',
        email: 'comm@example.com',
        name: 'Community User',
        profile_image: 'img-user',
        type: 'dummy',
        refresh_token: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const course = {
        id: 1,
        uuid: 'course-uuid',
        course_name: 'Course Name',
        course_image: 'img-course',
        subway: 'subway',
        line: 'line',
        customs: 'customs',
        created_at: new Date(),
      } as CourseEntity;
      const community: CommunityEntity = {
        uuid: commUuid,
        course_uuid: 'course-uuid',
        user_uuid: 'someone-else',
        review: 'Nice',
        score: 4,
        course_name: 'Course 1',
      } as CommunityEntity;

      communityQueryRepository.findOne.mockResolvedValue(community);
      bookmarkQueryRepository.findMyCourse.mockResolvedValue([]);
      courseQueryRepository.findOne.mockResolvedValue(course);
      courseQueryRepository.findPlace.mockResolvedValue([]);
      reactionQueryRepository.findCommunityDetailReaction.mockResolvedValue([]);
      userQueryRepository.findOne.mockResolvedValue(communityUser as any);
      commentQueryRepository.findMyComment.mockResolvedValue(null);

      // When
      const result = await communityService.communityDetail(commUuid, user);

      // Then
      expect(result.is_commented).toBe(false);
    });
  });

  describe('communityPut', () => {
    it('should throw NotFoundException when community not found', async () => {
      // Given
      const commUuid = 'comm-uuid';
      const user = { uuid: 'user-uuid' } as UserDto;
      const dto: ApiCommunityPutRequestBodyDto = { review: 'Updated review', score: 4 };
      communityQueryRepository.findOne.mockResolvedValue(null);
      // When & Then
      await expect(communityService.communityPut(user, dto, commUuid)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when user is not the owner', async () => {
      // Given
      const commUuid = 'comm-uuid';
      const user = { uuid: 'user-uuid' } as UserDto;
      const dto: ApiCommunityPutRequestBodyDto = { review: 'Updated review', score: 4 };
      const community: CommunityEntity = {
        uuid: commUuid,
        user_uuid: 'other-uuid',
      } as CommunityEntity;
      communityQueryRepository.findOne.mockResolvedValue(community);
      // When & Then
      await expect(communityService.communityPut(user, dto, commUuid)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update community and return UuidResponseDto', async () => {
      // Given
      const commUuid = 'comm-uuid';
      const user = { uuid: 'user-uuid' } as UserDto;
      const dto: ApiCommunityPutRequestBodyDto = { review: 'Updated review', score: 4 };
      const community: CommunityEntity = {
        uuid: commUuid,
        user_uuid: 'user-uuid',
        review: 'Old review',
        score: 3,
      } as CommunityEntity;
      communityQueryRepository.findOne.mockResolvedValue(community);
      communityQueryRepository.save.mockResolvedValue({
        ...community,
        review: dto.review,
        score: dto.score,
      } as CommunityEntity);
      // When
      const result = await communityService.communityPut(user, dto, commUuid);
      // Then
      expect(communityQueryRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ uuid: commUuid });
    });
  });

  describe('communityDelete', () => {
    it('should throw NotFoundException when community not found', async () => {
      // Given
      const commUuid = 'comm-uuid';
      const user = { uuid: 'user-uuid' } as UserDto;
      communityQueryRepository.findOne.mockResolvedValue(null);
      // When & Then
      await expect(communityService.communityDelete(user, commUuid)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when user is not the owner', async () => {
      // Given
      const commUuid = 'comm-uuid';
      const user = { uuid: 'user-uuid' } as UserDto;
      const community: CommunityEntity = {
        uuid: commUuid,
        user_uuid: 'other-uuid',
      } as CommunityEntity;
      communityQueryRepository.findOne.mockResolvedValue(community);
      // When & Then
      await expect(communityService.communityDelete(user, commUuid)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should mark community as deleted and return UuidResponseDto', async () => {
      // Given
      const commUuid = 'comm-uuid';
      const user = { uuid: 'user-uuid' } as UserDto;
      const community: CommunityEntity = {
        uuid: commUuid,
        user_uuid: 'user-uuid',
      } as CommunityEntity;
      communityQueryRepository.findOne.mockResolvedValue(community);
      communityQueryRepository.save.mockResolvedValue({
        ...community,
        archived_at: new Date(),
      } as CommunityEntity);
      // When
      const result = await communityService.communityDelete(user, commUuid);
      // Then
      expect(communityQueryRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ uuid: commUuid });
    });
  });

  it('should return { is_posted: true } when a community exists for the given uuid', async () => {
    // Given
    const courseUuid = 'course-exists';
    communityQueryRepository.findCourse.mockResolvedValue({ uuid: courseUuid } as any);

    // When
    const result = await communityService.checkPosted(courseUuid);

    // Then
    expect(communityQueryRepository.findCourse).toHaveBeenCalledWith(courseUuid);
    expect(result).toEqual({ is_posted: true });
  });

  it('should return { is_posted: false } when no community exists for the given uuid', async () => {
    // Given
    const courseUuid = 'course-missing';
    communityQueryRepository.findCourse.mockResolvedValue(null);

    // When
    const result = await communityService.checkPosted(courseUuid);

    // Then
    expect(communityQueryRepository.findCourse).toHaveBeenCalledWith(courseUuid);
    expect(result).toEqual({ is_posted: false });
  });
});
