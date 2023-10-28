import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/auth/constants/error';
import { ResponseDataDto } from 'src/commons/dto/response.dto';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { SearchDto, SearchListDto } from './dto/search.dto';
import { SearchQueryRepository } from './search.query.repository';

@Injectable()
export class SearchService {
  constructor(
    private readonly searchQueryRepository: SearchQueryRepository,
    private readonly placeQueryRepository: PlaceQueryRepository,
  ) {}

  async searchPlace(dto: SearchDto) {
    if (!dto.place_name) {
      throw Error(ERROR.NOT_EXIST_DATA);
    }
    const searchList = await this.placeQueryRepository.search(dto);
    if (!searchList || searchList.length === 0) {
      return ResponseDataDto.from([], null, 0);
    }

    const searchListDto: SearchListDto[] = plainToInstance(SearchListDto, searchList, {
      excludeExtraneousValues: true,
    });

    const last_item_id = searchList.length > 0 ? searchList[searchList.length - 1].id : 0;

    return ResponseDataDto.from(searchListDto, null, last_item_id);
  }
}
