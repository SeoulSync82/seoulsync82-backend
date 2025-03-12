import { TestBed } from '@automock/jest';
import { LastItemIdResponseDto } from 'src/commons/dtos/last-item-id-response.dto';
import { ListResponseDto } from 'src/commons/dtos/list-response.dto';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { ApiSearchGetDetailResponseDto } from 'src/search/dto/api-search-get-detail-response.dto';
import { ApiSearchGetRecentResponseDto } from 'src/search/dto/api-search-get-recent-response.dto';
import { ApiSearchGetRequestQueryDto } from 'src/search/dto/api-search-get-request-query.dto';
import { ApiSearchGetResponseDto } from 'src/search/dto/api-search-get-response.dto';
import { SearchController } from 'src/search/search.controller';
import { SearchService } from 'src/search/search.service';
import { UserDto } from 'src/user/dto/user.dto';

describe('SearchController', () => {
  let searchController: SearchController;
  let searchService: jest.Mocked<SearchService>;

  beforeEach(async () => {
    // Given
    const { unit, unitRef } = TestBed.create(SearchController).compile();
    searchController = unit;
    searchService = unitRef.get(SearchService);
    jest.clearAllMocks();
  });

  describe('getSearchPlace', () => {
    it('should return search results when valid dto and user provided', async () => {
      // Given
      const dto: ApiSearchGetRequestQueryDto = {
        search: 'test',
        size: 2,
      } as ApiSearchGetRequestQueryDto;
      const user: UserDto = { uuid: 'user-123', nickname: 'TestUser' } as UserDto;
      const expectedResponse: LastItemIdResponseDto<ApiSearchGetResponseDto> = {
        items: [{ id: 1 } as ApiSearchGetResponseDto],
        last_item_id: 1,
      };
      jest.spyOn(searchService, 'getSearchPlace').mockResolvedValue(expectedResponse);
      // When
      const result = await searchController.getSearchPlace(dto, user);
      // Then
      expect(searchService.getSearchPlace).toHaveBeenCalledWith(dto, user);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getPopularSearches', () => {
    it('should return a list of popular searches', async () => {
      // Given
      const expectedResponse: ListResponseDto<string> = {
        items: ['마라탕', '더현대', '스시', '아쿠아리움', '감자탕'],
      };
      jest.spyOn(searchService, 'getPopularSearches').mockResolvedValue(expectedResponse);
      // When
      const result = await searchController.getPopularSearches();
      // Then
      expect(searchService.getPopularSearches).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getRecentSearches', () => {
    it('should return recent searches when user provided', async () => {
      // Given
      const user: UserDto = { uuid: 'user-123', nickname: 'TestUser' } as UserDto;
      const expectedResponse: ListResponseDto<ApiSearchGetRecentResponseDto> = {
        items: [{ search: 'search' } as ApiSearchGetRecentResponseDto],
      };
      jest.spyOn(searchService, 'getRecentSearches').mockResolvedValue(expectedResponse);
      // When
      const result = await searchController.getRecentSearches(user);
      // Then
      expect(searchService.getRecentSearches).toHaveBeenCalledWith(user);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('deleteSearchLog', () => {
    it('should delete a search log and return UuidResponseDto', async () => {
      // Given
      const uuid = 'log-uuid';
      const user: UserDto = { uuid: 'user-123', nickname: 'TestUser' } as UserDto;
      const expectedResponse: UuidResponseDto = { uuid };
      jest.spyOn(searchService, 'deleteSearchLog').mockResolvedValue(expectedResponse);
      // When
      const result = await searchController.deleteSearchLog(uuid, user);
      // Then
      expect(searchService.deleteSearchLog).toHaveBeenCalledWith(uuid, user);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('deleteAllSearchLog', () => {
    it('should delete all search logs and return UuidResponseDto', async () => {
      // Given
      const user: UserDto = { uuid: 'user-123', nickname: 'TestUser' } as UserDto;
      const expectedResponse: UuidResponseDto = { uuid: user.uuid };
      jest.spyOn(searchService, 'deleteAllSearchLog').mockResolvedValue(expectedResponse);
      // When
      const result = await searchController.deleteAllSearchLog(user);
      // Then
      expect(searchService.deleteAllSearchLog).toHaveBeenCalledWith(user);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getSearchDetail', () => {
    it('should return search detail when valid uuid provided', async () => {
      // Given
      const uuid = 'place-uuid';
      const expectedResponse: ApiSearchGetDetailResponseDto = {
        id: 1,
      } as ApiSearchGetDetailResponseDto;
      jest.spyOn(searchService, 'getSearchDetail').mockResolvedValue(expectedResponse);
      // When
      const result = await searchController.getSearchDetail(uuid);
      // Then
      expect(searchService.getSearchDetail).toHaveBeenCalledWith(uuid);
      expect(result).toEqual(expectedResponse);
    });
  });
});
