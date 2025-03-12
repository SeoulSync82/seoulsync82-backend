import { TestBed } from '@automock/jest';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { LastItemIdResponseDto } from 'src/commons/dtos/last-item-id-response.dto';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import * as generateUUID from 'src/commons/util/uuid';
import { PlaceEntity } from 'src/entities/place.entity';
import { SearchLogEntity } from 'src/entities/search_log.entity';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { ApiSearchGetDetailResponseDto } from 'src/search/dto/api-search-get-detail-response.dto';
import { ApiSearchGetRecentResponseDto } from 'src/search/dto/api-search-get-recent-response.dto';
import { ApiSearchGetRequestQueryDto } from 'src/search/dto/api-search-get-request-query.dto';
import { ApiSearchGetResponseDto } from 'src/search/dto/api-search-get-response.dto';
import { SearchQueryRepository } from 'src/search/search.query.repository';
import { UserDto } from 'src/user/dto/user.dto';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;
  let searchQueryRepository: jest.Mocked<SearchQueryRepository>;
  let placeQueryRepository: jest.Mocked<PlaceQueryRepository>;

  beforeEach(async () => {
    // given
    const { unit, unitRef } = TestBed.create(SearchService).compile();
    service = unit;
    searchQueryRepository = unitRef.get(SearchQueryRepository);
    placeQueryRepository = unitRef.get(PlaceQueryRepository);
    jest.clearAllMocks();
  });

  describe('getSearchPlace', () => {
    const dto = { search: 'test', size: 5 } as ApiSearchGetRequestQueryDto;
    const user: UserDto = { uuid: 'user-uuid', nickname: 'TestUser' } as UserDto;

    it('should add new search log when none exists', async () => {
      // given
      searchQueryRepository.findUserSearchLog.mockResolvedValue([]);
      jest.spyOn(generateUUID, 'generateUUID').mockReturnValue('new-log-uuid');
      searchQueryRepository.addLog.mockResolvedValue(undefined);
      placeQueryRepository.getSearchPlace.mockResolvedValue([]);
      // when
      const result = await service.getSearchPlace(dto, user);
      // then
      expect(searchQueryRepository.addLog).toHaveBeenCalledWith(
        dto.search,
        expect.any(String),
        user,
      );
      expect(result).toEqual({ items: [], last_item_id: 0 });
    });

    it('should update search log when one exists', async () => {
      // given
      const existingLog: SearchLogEntity = { id: 1, search: 'test' } as SearchLogEntity;
      searchQueryRepository.findUserSearchLog.mockResolvedValue([existingLog]);
      searchQueryRepository.updateSearchDate.mockResolvedValue(undefined);
      placeQueryRepository.getSearchPlace.mockResolvedValue([]);
      // when
      const result = await service.getSearchPlace(dto, user);
      // then
      expect(searchQueryRepository.updateSearchDate).toHaveBeenCalledWith(existingLog.id);
      expect(result).toEqual({ items: [], last_item_id: 0 });
    });

    it('should set last_item_id to the last element id when searchList length equals dto.size', async () => {
      // given
      const dtoWithSize = { ...dto, size: 2 } as ApiSearchGetRequestQueryDto;
      const searchResults: PlaceEntity[] = [
        { id: 100, uuid: 'place-100' },
        { id: 200, uuid: 'place-200' },
      ] as PlaceEntity[];
      searchQueryRepository.findUserSearchLog.mockResolvedValue([]);
      jest.spyOn(generateUUID, 'generateUUID').mockReturnValue('new-log-uuid');
      searchQueryRepository.addLog.mockResolvedValue(undefined);
      // given
      placeQueryRepository.getSearchPlace.mockResolvedValue(searchResults);
      // when
      const result = await service.getSearchPlace(dtoWithSize, user);
      expect(result.last_item_id).toBe(200);
    });

    it('should return search results when available', async () => {
      // given
      const searchResults: PlaceEntity[] = [
        { id: 1, uuid: 'place-1' },
        { id: 2, uuid: 'place-2' },
      ] as PlaceEntity[];
      searchQueryRepository.findUserSearchLog.mockResolvedValue([]);
      jest.spyOn(generateUUID, 'generateUUID').mockReturnValue('new-log-uuid');
      searchQueryRepository.addLog.mockResolvedValue(undefined);
      placeQueryRepository.getSearchPlace.mockResolvedValue(searchResults);
      // when
      const result: LastItemIdResponseDto<ApiSearchGetResponseDto> = await service.getSearchPlace(
        dto,
        user,
      );
      // then
      const expectedItems = plainToInstance(ApiSearchGetResponseDto, searchResults, {
        excludeExtraneousValues: true,
      });
      const expectedLastItemId =
        searchResults.length === dto.size ? searchResults[searchResults.length - 1].id : 0;
      expect(result).toMatchObject({ items: expectedItems, last_item_id: expectedLastItemId });
    });
  });

  describe('getPopularSearches', () => {
    it('should return a list of popular searches', async () => {
      // given
      // when
      const result = await service.getPopularSearches();
      // then
      expect(result).toEqual({ items: ['마라탕', '더현대', '스시', '아쿠아리움', '감자탕'] });
    });
  });

  describe('getRecentSearches', () => {
    it('should return empty list when no recent searches found', async () => {
      // given
      const user: UserDto = { uuid: 'user-uuid', nickname: 'TestUser' } as UserDto;
      searchQueryRepository.findRecentUserLog.mockResolvedValue([]);
      // when
      const result = await service.getRecentSearches(user);
      // then
      expect(result).toEqual({ items: [] });
    });

    it('should return recent searches when found', async () => {
      // given
      const user: UserDto = { uuid: 'user-uuid', nickname: 'TestUser' } as UserDto;
      const recentLogs: SearchLogEntity[] = [
        { id: 1, search: 'test1' },
        { id: 2, search: 'test2' },
      ] as SearchLogEntity[];
      searchQueryRepository.findRecentUserLog.mockResolvedValue(recentLogs);
      // when
      const result = await service.getRecentSearches(user);
      // then
      const expectedItems = plainToInstance(ApiSearchGetRecentResponseDto, recentLogs, {
        excludeExtraneousValues: true,
      });
      expect(result).toMatchObject({ items: expectedItems });
    });
  });

  describe('deleteSearchLog', () => {
    it('should throw NotFoundException if search log not found', async () => {
      // given
      const uuid = 'non-existent-uuid';
      const user: UserDto = { uuid: 'user-uuid', nickname: 'TestUser' } as UserDto;
      searchQueryRepository.findUserLogToUuid.mockResolvedValue(null);
      // when & then
      await expect(service.deleteSearchLog(uuid, user)).rejects.toThrow(NotFoundException);
    });

    it('should delete search log and return UuidResponseDto', async () => {
      // given
      const uuid = 'log-uuid';
      const user: UserDto = { uuid: 'user-uuid', nickname: 'TestUser' } as UserDto;
      const searchLog: SearchLogEntity = { id: 1, uuid, search: 'test' } as SearchLogEntity;
      searchQueryRepository.findUserLogToUuid.mockResolvedValue(searchLog);
      searchQueryRepository.deleteSearchLog.mockResolvedValue(undefined);
      // when
      const result: UuidResponseDto = await service.deleteSearchLog(uuid, user);
      // then
      expect(searchQueryRepository.findUserLogToUuid).toHaveBeenCalledWith(uuid, user);
      expect(searchQueryRepository.deleteSearchLog).toHaveBeenCalledWith(searchLog);
      expect(result).toEqual({ uuid });
    });
  });

  describe('deleteAllSearchLog', () => {
    it('should throw NotFoundException if no search logs found', async () => {
      // given
      const user: UserDto = { uuid: 'user-uuid', nickname: 'TestUser' } as UserDto;
      searchQueryRepository.findUserTotalSearchLog.mockResolvedValue([]);

      // when & then
      await expect(service.deleteAllSearchLog(user)).rejects.toThrow(NotFoundException);
    });

    it('should delete all search logs and return UuidResponseDto', async () => {
      // given
      const user: UserDto = { uuid: 'user-uuid', nickname: 'TestUser' } as UserDto;
      const logs: SearchLogEntity[] = [
        { id: 1, uuid: 'log1', search: 'test1', user_uuid: user.uuid, archived_at: null },
        { id: 2, uuid: 'log2', search: 'test2', user_uuid: user.uuid, archived_at: null },
      ] as SearchLogEntity[];

      searchQueryRepository.findUserTotalSearchLog.mockResolvedValue(logs);
      jest.spyOn(searchQueryRepository, 'updateDateDelete').mockResolvedValue(undefined);

      // when
      const result: UuidResponseDto = await service.deleteAllSearchLog(user);

      // then
      expect(searchQueryRepository.findUserTotalSearchLog).toHaveBeenCalledWith(user);
      expect(searchQueryRepository.updateDateDelete).toHaveBeenCalledWith(logs);
      expect(result).toEqual({ uuid: user.uuid });
    });
  });

  describe('getSearchDetail', () => {
    it('should throw NotFoundException if search detail not found', async () => {
      // given
      const uuid = 'non-existent-uuid';
      placeQueryRepository.findOne.mockResolvedValue(null);
      // when & then
      await expect(service.getSearchDetail(uuid)).rejects.toThrow(NotFoundException);
    });

    it('should return search detail dto when found', async () => {
      // given
      const uuid = 'place-uuid';
      const place: PlaceEntity = { uuid, id: 1 } as PlaceEntity;
      placeQueryRepository.findOne.mockResolvedValue(place);
      // when
      const result = await service.getSearchDetail(uuid);
      // then
      const expected = plainToInstance(ApiSearchGetDetailResponseDto, place, {
        excludeExtraneousValues: true,
      });
      expect(result).toMatchObject(expected);
    });
  });
});
