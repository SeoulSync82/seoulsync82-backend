import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/auth/constants/error';
import { DetailResponseDto, ResponseDataDto } from 'src/commons/dto/response.dto';
import { generateUUID } from 'src/commons/util/uuid';
import { PlaceEntity } from 'src/entities/place.entity';
import { SearchLogEntity } from 'src/entities/search_log.entity';
import { CultureDto } from 'src/place/dto/place.dto';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { SearchDetailDto, SearchDto, SearchListDto } from './dto/search.dto';
import { SearchQueryLogRepository } from './search.log.query.repository';
import { SearchQueryRepository } from './search.query.repository';

@Injectable()
export class SearchService {
  constructor(
    private readonly searchQueryRepository: SearchQueryRepository,
    private readonly placeQueryRepository: PlaceQueryRepository,
    private readonly searchQueryLogRepository: SearchQueryLogRepository,
  ) {}

  async searchPlace(dto: SearchDto, user) {
    if (!dto.search) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }
    const searchList = await this.placeQueryRepository.search(dto);
    if (!searchList || searchList.length === 0) {
      return ResponseDataDto.from([], null, 0);
    }

    const searchListDto: SearchListDto[] = plainToInstance(SearchListDto, searchList, {
      excludeExtraneousValues: true,
    });

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

    const last_item_id = searchList.length === dto.size ? searchList[searchList.length - 1].id : 0;

    return { items: searchListDto, last_item_id };
  }

  async searchDetail(uuid) {
    const searchDetail: PlaceEntity = await this.placeQueryRepository.findOne(uuid);
    if (!searchDetail) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const searchDetailDto: SearchDetailDto = plainToInstance(SearchDetailDto, searchDetail, {
      excludeExtraneousValues: true,
    });

    return searchDetailDto;
  }

  async searchPopular() {
    const result = ['곱찹', '라멘', '감자탕', '돈까스', '스시'];
    return ResponseDataDto.from(result, null, 0);
  }

  async searchRecent(user) {
    const searchLog = await this.searchQueryLogRepository.find(user);
    if (searchLog.length === 0) {
      return ResponseDataDto.from([], null, 0);
    }

    return ResponseDataDto.from(searchLog, null, 0);
  }
}
