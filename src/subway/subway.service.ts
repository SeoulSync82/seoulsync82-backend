import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/auth/constants/error';
import { isEmpty } from 'src/commons/util/is/is-empty';
import { CustomListDto } from 'src/place/dto/subway.dto';
import { ApiSubwayGetCheckRequestQueryDto } from './dto/api-subway-get-check-request-query.dto';
import { ApiSubwayGetCheckResponseDto } from './dto/api-subway-get-check-response.dto';
import { ApiSubwayGetLineResponseDto } from './dto/api-subway-get-line-response.dto';
import { ApiSubwayGetListResponseDto } from './dto/api-subway-get-list-response.dto';
import { SubwayQueryRepository } from './subway.query.repository';

@Injectable()
export class SubwayService {
  constructor(private readonly subwayQueryRepository: SubwayQueryRepository) {}

  async subwayCustomsCheck(dto: ApiSubwayGetCheckRequestQueryDto) {
    const subwayCustoms = await this.subwayQueryRepository.groupByCustoms(dto);
    const subwayCurrentCulture = await this.subwayQueryRepository.findSubwayCurrentCulture(dto);

    function findCountByType(type, results) {
      const item = results.find((item) => item.type === type);
      return item ? parseInt(item.count, 10) : 0;
    }

    const customsCheck = new CustomListDto({
      음식점: findCountByType('음식점', subwayCustoms),
      카페: findCountByType('카페', subwayCustoms),
      술집: findCountByType('술집', subwayCustoms),
      쇼핑: findCountByType('쇼핑', subwayCustoms),
      문화:
        findCountByType('전시', subwayCurrentCulture) +
        findCountByType('팝업', subwayCurrentCulture),
      놀거리: findCountByType('놀거리', subwayCustoms),
    });

    return new ApiSubwayGetCheckResponseDto({ items: [customsCheck] });
  }

  async subwayStationList(uuid: string) {
    const subwayStationList = await this.subwayQueryRepository.subwayStationList(uuid);
    if (isEmpty(subwayStationList)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const apiSubwayListGetResponseDto = plainToInstance(
      ApiSubwayGetListResponseDto,
      { items: subwayStationList.map((station) => station.name) },
      { excludeExtraneousValues: true },
    );

    return apiSubwayListGetResponseDto;
  }

  async subwayLineList() {
    const subwayLine = await this.subwayQueryRepository.findSubwayLine();
    const apiSubwayLineGetResponseDto = plainToInstance(
      ApiSubwayGetLineResponseDto,
      { items: subwayLine.map((item) => ({ uuid: item.uuid, line: item.line })) },
      { excludeExtraneousValues: true },
    );

    return apiSubwayLineGetResponseDto;
  }
}
