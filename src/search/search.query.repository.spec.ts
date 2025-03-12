import { TestBed } from '@automock/jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SearchLogEntity } from 'src/entities/search_log.entity';
import { SearchQueryRepository } from 'src/search/search.query.repository';
import { UserDto } from 'src/user/dto/user.dto';
import { In, IsNull, Repository } from 'typeorm';

describe('SearchQueryRepository', () => {
  let searchQueryRepository: SearchQueryRepository;
  let searchLogRepository: jest.Mocked<Repository<SearchLogEntity>>;

  beforeEach(async () => {
    // Given: 테스트 모듈 구성 및 의존성 주입
    const { unit, unitRef } = TestBed.create(SearchQueryRepository).compile();
    searchQueryRepository = unit;
    searchLogRepository = unitRef.get(getRepositoryToken(SearchLogEntity) as string);
    jest.clearAllMocks();
  });

  describe('findUserSearchLog', () => {
    it('should return logs matching search, user, and non-archived', async () => {
      // Given
      const search = 'test';
      const user: UserDto = { uuid: 'user-123', nickname: 'TestUser' } as UserDto;
      const expectedLogs: SearchLogEntity[] = [
        { id: 1, uuid: 'log-1', search, user_uuid: user.uuid, archived_at: null },
      ] as SearchLogEntity[];
      jest.spyOn(searchLogRepository, 'find').mockResolvedValue(expectedLogs);

      // When
      const result = await searchQueryRepository.findUserSearchLog(search, user);

      // Then
      expect(searchLogRepository.find).toHaveBeenCalledWith({
        where: { search, user_uuid: user.uuid, archived_at: IsNull() },
      });
      expect(result).toEqual(expectedLogs);
    });
  });

  describe('addLog', () => {
    it('should insert a new search log', async () => {
      // Given
      const search = 'test';
      const uuid = 'log-uuid';
      const user: UserDto = { uuid: 'user-123', nickname: 'TestUser' } as UserDto;
      jest.spyOn(searchLogRepository, 'insert').mockResolvedValue(undefined);

      // When
      const result = await searchQueryRepository.addLog(search, uuid, user);

      // Then
      expect(searchLogRepository.insert).toHaveBeenCalledWith({
        uuid,
        search,
        user_uuid: user.uuid,
      });
      expect(result).toBeUndefined();
    });
  });

  describe('updateSearchDate', () => {
    it('should update the updated_at field for the given log id', async () => {
      // Given
      const id = 1;
      jest.spyOn(searchLogRepository, 'update').mockResolvedValue(undefined);

      // When
      const result = await searchQueryRepository.updateSearchDate(id);

      // Then
      expect(searchLogRepository.update).toHaveBeenCalledWith(
        { id },
        { updated_at: expect.any(Date) },
      );
      expect(result).toBeUndefined();
    });
  });

  describe('findRecentUserLog', () => {
    it('should return recent logs for the given user', async () => {
      // Given
      const user: UserDto = { uuid: 'user-123', nickname: 'TestUser' } as UserDto;
      const expectedLogs: SearchLogEntity[] = [
        { id: 1, uuid: 'log1', user_uuid: user.uuid, archived_at: null },
      ] as SearchLogEntity[];
      jest.spyOn(searchLogRepository, 'find').mockResolvedValue(expectedLogs);

      // When
      const result = await searchQueryRepository.findRecentUserLog(user);

      // Then
      expect(searchLogRepository.find).toHaveBeenCalledWith({
        where: { user_uuid: user.uuid, archived_at: IsNull() },
        order: { updated_at: 'DESC' },
        take: 10,
      });
      expect(result).toEqual(expectedLogs);
    });
  });

  describe('findUserLogToUuid', () => {
    it('should return a search log for the given uuid and user', async () => {
      // Given
      const uuid = 'log-uuid';
      const user: UserDto = { uuid: 'user-123', nickname: 'TestUser' } as UserDto;
      const expectedLog: SearchLogEntity = {
        id: 1,
        uuid,
        user_uuid: user.uuid,
        archived_at: null,
      } as SearchLogEntity;
      jest.spyOn(searchLogRepository, 'findOne').mockResolvedValue(expectedLog);

      // When
      const result = await searchQueryRepository.findUserLogToUuid(uuid, user);

      // Then
      expect(searchLogRepository.findOne).toHaveBeenCalledWith({
        where: { uuid, user_uuid: user.uuid, archived_at: IsNull() },
      });
      expect(result).toEqual(expectedLog);
    });
  });

  describe('deleteSearchLog', () => {
    it('should mark the log as archived', async () => {
      // Given
      const log: SearchLogEntity = {
        id: 1,
        uuid: 'log-uuid',
        archived_at: null,
      } as SearchLogEntity;
      jest.spyOn(searchLogRepository, 'update').mockResolvedValue(undefined);

      // When
      const result = await searchQueryRepository.deleteSearchLog(log);

      // Then
      expect(searchLogRepository.update).toHaveBeenCalledWith(
        { id: log.id },
        { archived_at: expect.any(Date) },
      );
      expect(result).toBeUndefined();
    });
  });

  describe('findUserTotalSearchLog', () => {
    it('should return all non-archived logs for the given user', async () => {
      // Given
      const user: UserDto = { uuid: 'user-123', nickname: 'TestUser' } as UserDto;
      const expectedLogs: SearchLogEntity[] = [
        { id: 1, uuid: 'log1', user_uuid: user.uuid, archived_at: null },
      ] as SearchLogEntity[];
      jest.spyOn(searchLogRepository, 'find').mockResolvedValue(expectedLogs);

      // When
      const result = await searchQueryRepository.findUserTotalSearchLog(user);

      // Then
      expect(searchLogRepository.find).toHaveBeenCalledWith({
        where: { user_uuid: user.uuid, archived_at: IsNull() },
      });
      expect(result).toEqual(expectedLogs);
    });
  });

  describe('save', () => {
    it('should update archived_at for given logs in a single update call', async () => {
      // given
      const logs: SearchLogEntity[] = [
        { id: 1, uuid: 'log1', search: 'test1', user_uuid: 'user-uuid', archived_at: null },
        { id: 2, uuid: 'log2', search: 'test2', user_uuid: 'user-uuid', archived_at: null },
      ] as SearchLogEntity[];
      const ids = logs.map((entity) => entity.id);

      jest.spyOn(searchLogRepository, 'update').mockResolvedValue({ affected: logs.length } as any);

      // when
      await searchQueryRepository.updateDateDelete(logs);

      // then
      expect(searchLogRepository.update).toHaveBeenCalledWith(
        { id: In(ids) },
        { archived_at: expect.any(Date) },
      );
    });
  });
});
