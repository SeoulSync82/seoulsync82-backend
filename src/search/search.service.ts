import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/auth/constants/error';
import { DetailResponseDto, ResponseDataDto } from 'src/commons/dto/response.dto';
import { isEmpty } from 'src/commons/util/is/is-empty';
import { generateUUID } from 'src/commons/util/uuid';
import { PlaceEntity } from 'src/entities/place.entity';
import { SearchLogEntity } from 'src/entities/search_log.entity';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { ApiSearchDetailGetResponseDto } from './dto/api-search-detail-get-response.dto';
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

  async searchPlace(dto: ApiSearchGetRequestQueryDto, user) {
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
      return { items: [] };
    }

    const apiSearchGetResponseDto = plainToInstance(ApiSearchGetResponseDto, searchList, {
      excludeExtraneousValues: true,
    });

    const last_item_id = searchList.length === dto.size ? searchList[searchList.length - 1].id : 0;

    return { items: apiSearchGetResponseDto, last_item_id };
  }

  async searchDetail(uuid) {
    const searchDetail: PlaceEntity = await this.placeQueryRepository.findOne(uuid);
    if (!searchDetail) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const apiSearchDetailGetResponseDto: SearchDetailDto = plainToInstance(
      ApiSearchDetailGetResponseDto,
      searchDetail,
      {
        excludeExtraneousValues: true,
      },
    );

    return apiSearchDetailGetResponseDto;
  }

  async searchPopular() {
    const result = ['곱찹', '라멘', '감자탕', '돈까스', '스시'];
    return { items: [] };
  }

  async searchRecent(user) {
    const searchLog = await this.searchQueryLogRepository.find(user);
    if (searchLog.length === 0) {
      return ResponseDataDto.from([], null, 0);
    }

    return ResponseDataDto.from(searchLog, null, 0);
  }

  async deleteSearchLog(uuid, user) {
    const userSearchLog = await this.searchQueryLogRepository.findUserSearchLog(uuid, user);
    if (isEmpty(userSearchLog)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    await this.searchQueryLogRepository.deleteSearchLog(userSearchLog);

    return DetailResponseDto.uuid(uuid);
  }

  async deleteAllSearchLog(user) {
    const userAllSearchLog: SearchLogEntity[] =
      await this.searchQueryLogRepository.findUserSearchLogList(user);
    if (userAllSearchLog.length === 0) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    userAllSearchLog.forEach((log) => (log.archived_at = new Date()));

    await this.searchQueryLogRepository.save(userAllSearchLog);

    return { total: userAllSearchLog.length };
  }
}
