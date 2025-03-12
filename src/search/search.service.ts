import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/commons/constants/error';
import { LastItemIdResponseDto } from 'src/commons/dtos/last-item-id-response.dto';
import { ListResponseDto } from 'src/commons/dtos/list-response.dto';
import { UuidResponseDto } from 'src/commons/dtos/uuid-response.dto';
import { isEmpty } from 'src/commons/util/is/is-empty';
import { generateUUID } from 'src/commons/util/uuid';
import { PlaceEntity } from 'src/entities/place.entity';
import { SearchLogEntity } from 'src/entities/search_log.entity';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { ApiSearchGetDetailResponseDto } from 'src/search/dto/api-search-get-detail-response.dto';
import { ApiSearchGetRecentResponseDto } from 'src/search/dto/api-search-get-recent-response.dto';
import { ApiSearchGetRequestQueryDto } from 'src/search/dto/api-search-get-request-query.dto';
import { ApiSearchGetResponseDto } from 'src/search/dto/api-search-get-response.dto';
import { SearchDetailDto } from 'src/search/dto/search-detail.dto';
import { SearchQueryRepository } from 'src/search/search.query.repository';
import { UserDto } from 'src/user/dto/user.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly searchQueryRepository: SearchQueryRepository,
    private readonly placeQueryRepository: PlaceQueryRepository,
  ) {}

  async getSearchPlace(
    dto: ApiSearchGetRequestQueryDto,
    user: UserDto,
  ): Promise<LastItemIdResponseDto<ApiSearchGetResponseDto>> {
    const userSearchLog: SearchLogEntity[] = await this.searchQueryRepository.findUserSearchLog(
      dto.search,
      user,
    );
    const existingLog = userSearchLog.find((log) => log.search === dto.search);

    if (isEmpty(existingLog)) {
      const uuid = generateUUID();
      await this.searchQueryRepository.addLog(dto.search, uuid, user);
    } else {
      await this.searchQueryRepository.updateSearchDate(existingLog.id);
    }

    const searchList = await this.placeQueryRepository.getSearchPlace(dto);
    if (isEmpty(searchList)) {
      return { items: [], last_item_id: 0 };
    }

    const apiSearchGetResponseDto = plainToInstance(ApiSearchGetResponseDto, searchList, {
      excludeExtraneousValues: true,
    });

    const lastItemId = searchList.length === dto.size ? searchList[searchList.length - 1].id : 0;

    return { items: apiSearchGetResponseDto, last_item_id: lastItemId };
  }

  async getPopularSearches(): Promise<ListResponseDto<string>> {
    const result = ['마라탕', '더현대', '스시', '아쿠아리움', '감자탕'];
    return { items: result };
  }

  async getRecentSearches(user: UserDto): Promise<ListResponseDto<ApiSearchGetRecentResponseDto>> {
    const searchLog: SearchLogEntity[] = await this.searchQueryRepository.findRecentUserLog(user);
    if (isEmpty(searchLog)) {
      return { items: [] };
    }

    return {
      items: plainToInstance(ApiSearchGetRecentResponseDto, searchLog, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async deleteSearchLog(uuid: string, user: UserDto): Promise<UuidResponseDto> {
    const userSearchLog = await this.searchQueryRepository.findUserLogToUuid(uuid, user);
    if (isEmpty(userSearchLog)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    await this.searchQueryRepository.deleteSearchLog(userSearchLog);

    return { uuid };
  }

  async deleteAllSearchLog(user: UserDto): Promise<UuidResponseDto> {
    const userTotalSearchLog: SearchLogEntity[] =
      await this.searchQueryRepository.findUserTotalSearchLog(user);
    if (isEmpty(userTotalSearchLog)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    await this.searchQueryRepository.updateDateDelete(userTotalSearchLog);

    return { uuid: user.uuid };
  }

  async getSearchDetail(uuid: string): Promise<ApiSearchGetDetailResponseDto> {
    const searchDetail: PlaceEntity = await this.placeQueryRepository.findOne(uuid);
    if (isEmpty(searchDetail)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const apiSearchDetailGetResponseDto: SearchDetailDto = plainToInstance(
      ApiSearchGetDetailResponseDto,
      searchDetail,
      {
        excludeExtraneousValues: true,
      },
    );

    return apiSearchDetailGetResponseDto;
  }
}
