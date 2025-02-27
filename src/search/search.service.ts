import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/commons/constants/error';
import { isEmpty } from 'src/commons/util/is/is-empty';
import { generateUUID } from 'src/commons/util/uuid';
import { PlaceEntity } from 'src/entities/place.entity';
import { SearchLogEntity } from 'src/entities/search_log.entity';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { UserDto } from 'src/user/dto/user.dto';
import { LastItemIdResponseDto } from '../commons/dtos/last-item-id-response.dto';
import { ListResponseDto } from '../commons/dtos/list-response.dto';
import { UuidResponseDto } from '../commons/dtos/uuid-response.dto';
import { ApiSearchGetDetailResponseDto } from './dto/api-search-get-detail-response.dto';
import { ApiSearchGetRequestQueryDto } from './dto/api-search-get-request-query.dto';
import { ApiSearchGetResponseDto } from './dto/api-search-get-response.dto';
import { SearchDetailDto } from './dto/search.dto';
import { SearchQueryLogRepository } from './search.log.query.repository';
import { SearchQueryRepository } from './search.query.repository';

@Injectable()
export class SearchService {
  constructor(
    private readonly searchQueryRepository: SearchQueryRepository,
    private readonly placeQueryRepository: PlaceQueryRepository,
    private readonly searchQueryLogRepository: SearchQueryLogRepository,
  ) {}

  async searchPlace(
    dto: ApiSearchGetRequestQueryDto,
    user: UserDto,
  ): Promise<LastItemIdResponseDto<ApiSearchGetResponseDto>> {
    const searchLog: SearchLogEntity[] = await this.searchQueryLogRepository.findLog(
      dto.search,
      user,
    );
    if (!searchLog.map((item) => item.search).includes(dto.search)) {
      const uuid = generateUUID();
      await this.searchQueryLogRepository.insert(dto.search, uuid, user);
    } else {
      const id = searchLog.filter((item) => item.search === dto.search).map((item) => item.id);
      await this.searchQueryLogRepository.update(id);
    }

    const searchList = await this.placeQueryRepository.search(dto);
    if (!searchList || searchList.length === 0) {
      return { items: [], last_item_id: 0 };
    }

    const apiSearchGetResponseDto = plainToInstance(ApiSearchGetResponseDto, searchList, {
      excludeExtraneousValues: true,
    });

    const last_item_id = searchList.length === dto.size ? searchList[searchList.length - 1].id : 0;

    return { items: apiSearchGetResponseDto, last_item_id };
  }

  async searchDetail(uuid): Promise<ApiSearchGetDetailResponseDto> {
    const searchDetail: PlaceEntity = await this.placeQueryRepository.findOne(uuid);
    if (!searchDetail) {
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

  async searchPopular(): Promise<ListResponseDto<string>> {
    const result = ['마라탕', '더현대', '스시', '아쿠아리움', '감자탕'];
    return { items: result };
  }

  async searchRecent(user: UserDto): Promise<LastItemIdResponseDto<SearchLogEntity>> {
    const searchLog: SearchLogEntity[] = await this.searchQueryLogRepository.find(user);
    if (isEmpty(searchLog.length)) {
      return { items: [], last_item_id: 0 };
    }

    let last_item_id = 0;
    return { items: searchLog, last_item_id };
  }

  async deleteSearchLog(uuid, user: UserDto): Promise<UuidResponseDto> {
    const userSearchLog = await this.searchQueryLogRepository.findUserSearchLog(uuid, user);
    if (isEmpty(userSearchLog)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    await this.searchQueryLogRepository.deleteSearchLog(userSearchLog);

    return { uuid };
  }

  async deleteAllSearchLog(user: UserDto): Promise<UuidResponseDto> {
    const userAllSearchLog: SearchLogEntity[] =
      await this.searchQueryLogRepository.findUserSearchLogList(user);
    if (userAllSearchLog.length === 0) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    userAllSearchLog.forEach((log) => (log.archived_at = new Date()));

    await this.searchQueryLogRepository.save(userAllSearchLog);

    return { uuid: user.uuid };
  }
}
