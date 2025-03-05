import { TestBed } from '@automock/jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BookmarkQueryRepository } from 'src/bookmark/bookmark.query.repository';
import { ApiBookmarkGetRequestQueryDto } from 'src/bookmark/dto/api-bookmark-get-request-query.dto';
import { BookmarkEntity } from 'src/entities/bookmark.entity';
import { UserDto } from 'src/user/dto/user.dto';
import { In, IsNull, LessThan, Repository } from 'typeorm';

describe('BookmarkQueryRepository', () => {
  let bookmarkQueryRepository: BookmarkQueryRepository;
  let bookmarkRepository: jest.Mocked<Repository<BookmarkEntity>>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(BookmarkQueryRepository).compile();
    bookmarkQueryRepository = unit;
    bookmarkRepository = unitRef.get(getRepositoryToken(BookmarkEntity) as string);
    jest.clearAllMocks();
  });

  describe('find', () => {
    it('should return bookmarks when valid dto and user provided', async () => {
      // Given
      const dto: ApiBookmarkGetRequestQueryDto = { last_id: 10, size: 5 };
      const user: UserDto = { uuid: 'user-123' } as UserDto;
      const expectedBookmarks: BookmarkEntity[] = [
        {
          id: 1,
          uuid: 'bm-1',
          user_uuid: 'user-123',
          archived_at: null,
          course: {},
        } as BookmarkEntity,
      ];
      jest.spyOn(bookmarkRepository, 'find').mockResolvedValue(expectedBookmarks);

      // When
      const result = await bookmarkQueryRepository.find(dto, user);

      // Then
      expect(bookmarkRepository.find).toHaveBeenCalledWith({
        where: {
          user_uuid: user.uuid,
          archived_at: IsNull(),
          id: LessThan(dto.last_id),
        },
        relations: { course: true },
        order: { updated_at: 'DESC' },
        take: dto.size,
      });
      expect(result).toEqual(expectedBookmarks);
    });

    it('should return bookmarks without id condition when last_id is not > 0', async () => {
      // Given
      const dto: ApiBookmarkGetRequestQueryDto = { last_id: 0, size: 3 };
      const user: UserDto = { uuid: 'user-456' } as UserDto;
      const expectedBookmarks: BookmarkEntity[] = [
        {
          id: 2,
          uuid: 'bm-2',
          user_uuid: 'user-456',
          archived_at: null,
          course: {},
        } as BookmarkEntity,
      ];
      jest.spyOn(bookmarkRepository, 'find').mockResolvedValue(expectedBookmarks);

      // When
      const result = await bookmarkQueryRepository.find(dto, user);

      // Then
      expect(bookmarkRepository.find).toHaveBeenCalledWith({
        where: {
          user_uuid: user.uuid,
          archived_at: IsNull(),
        },
        relations: { course: true },
        order: { updated_at: 'DESC' },
        take: dto.size,
      });
      expect(result).toEqual(expectedBookmarks);
    });
  });

  describe('findOne', () => {
    it('should return a bookmark when uuid exists', async () => {
      // Given
      const uuid = 'bm-123';
      const expectedBookmark: BookmarkEntity = { id: 3, uuid, archived_at: null } as BookmarkEntity;
      jest.spyOn(bookmarkRepository, 'findOne').mockResolvedValue(expectedBookmark);

      // When
      const result = await bookmarkQueryRepository.findOne(uuid);

      // Then
      expect(bookmarkRepository.findOne).toHaveBeenCalledWith({
        where: { uuid, archived_at: IsNull() },
      });
      expect(result).toEqual(expectedBookmark);
    });
  });

  describe('findList', () => {
    it('should return bookmarks when provided uuids', async () => {
      // Given
      const uuids = ['bm-1', 'bm-2'];
      const expectedBookmarks: BookmarkEntity[] = [
        { id: 4, uuid: 'bm-1' } as BookmarkEntity,
        { id: 5, uuid: 'bm-2' } as BookmarkEntity,
      ];
      jest.spyOn(bookmarkRepository, 'find').mockResolvedValue(expectedBookmarks);

      // When
      const result = await bookmarkQueryRepository.findList(uuids);

      // Then
      expect(bookmarkRepository.find).toHaveBeenCalledWith({
        where: { uuid: In(uuids) },
      });
      expect(result).toEqual(expectedBookmarks);
    });
  });

  describe('findMyCourse', () => {
    it('should return bookmarks for given course uuid', async () => {
      // Given
      const courseUuid = 'course-789';
      const expectedBookmarks: BookmarkEntity[] = [
        { id: 6, course_uuid: courseUuid, archived_at: null } as BookmarkEntity,
      ];
      jest.spyOn(bookmarkRepository, 'find').mockResolvedValue(expectedBookmarks);

      // When
      const result = await bookmarkQueryRepository.findMyCourse(courseUuid);

      // Then
      expect(bookmarkRepository.find).toHaveBeenCalledWith({
        where: { course_uuid: courseUuid, archived_at: IsNull() },
      });
      expect(result).toEqual(expectedBookmarks);
    });
  });

  describe('bookmarkSave', () => {
    it('should save and return the bookmark entity', async () => {
      // Given
      const bookmark: BookmarkEntity = {
        id: 7,
        uuid: 'bm-save',
        archived_at: null,
      } as BookmarkEntity;
      jest.spyOn(bookmarkRepository, 'save').mockResolvedValue(bookmark);

      // When
      const result = await bookmarkQueryRepository.bookmarkSave(bookmark);

      // Then
      expect(bookmarkRepository.save).toHaveBeenCalledWith(bookmark);
      expect(result).toEqual(bookmark);
    });
  });

  describe('bookmarkDelete', () => {
    it('should update the bookmark as deleted (set archived_at) when provided bookmark entity', async () => {
      // Given
      const bookmark: BookmarkEntity = {
        id: 8,
        uuid: 'bm-del',
        archived_at: null,
      } as BookmarkEntity;
      jest.spyOn(bookmarkRepository, 'update').mockResolvedValue({} as any);

      // When
      await bookmarkQueryRepository.bookmarkDelete(bookmark);

      // Then
      expect(bookmarkRepository.update).toHaveBeenCalledWith(
        { id: bookmark.id },
        { archived_at: expect.any(Date) },
      );
    });
  });

  describe('bookmarkUpdate', () => {
    it('should update the bookmark as not deleted (set archived_at to null)', async () => {
      // Given
      const bookmark: BookmarkEntity = {
        id: 9,
        uuid: 'bm-upd',
        archived_at: new Date(),
      } as BookmarkEntity;
      jest.spyOn(bookmarkRepository, 'update').mockResolvedValue({} as any);

      // When
      await bookmarkQueryRepository.bookmarkUpdate(bookmark);

      // Then
      expect(bookmarkRepository.update).toHaveBeenCalledWith(
        { id: bookmark.id },
        { archived_at: null },
      );
    });
  });

  describe('findUserBookmark', () => {
    it('should return a bookmark for a given user and course uuid', async () => {
      // Given
      const user: UserDto = { uuid: 'user-999' } as UserDto;
      const courseUuid = 'course-555';
      const expectedBookmark: BookmarkEntity = {
        id: 10,
        uuid: 'bm-user',
        archived_at: null,
      } as BookmarkEntity;
      jest.spyOn(bookmarkRepository, 'findOne').mockResolvedValue(expectedBookmark);

      // When
      const result = await bookmarkQueryRepository.findUserBookmark(user, courseUuid);

      // Then
      expect(bookmarkRepository.findOne).toHaveBeenCalledWith({
        where: { user_uuid: user.uuid, course_uuid: courseUuid, archived_at: IsNull() },
      });
      expect(result).toEqual(expectedBookmark);
    });
  });
});
