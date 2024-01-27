import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/auth/constants/error';
import { isEmpty } from 'src/commons/util/is/is-empty';
import { CustomListDto } from 'src/place/dto/subway.dto';
import { ApiSubwayCheckGetRequestQueryDto } from './dto/api-subway-check-get-request-query.dto';
import { ApiSubwayCheckGetResponseDto } from './dto/api-subway-check-get-response.dto';
import { ApiSubwayLineGetResponseDto } from './dto/api-subway-line-get-response.dto';
import { ApiCourseSubwayListGetRequestQueryDto } from './dto/api-subway-list-get-request-query.dto';
import { ApiSubwayListGetResponseDto } from './dto/api-subway-list-get-response.dto';
import { SubwayQueryRepository } from './subway.query.repository';

@Injectable()
export class SubwayService {
  constructor(private readonly subwayQueryRepository: SubwayQueryRepository) {}

  async subwayCustomsCheck(dto: ApiSubwayCheckGetRequestQueryDto) {
    const subwayCustoms = await this.subwayQueryRepository.groupByCustoms(dto);

    function findCountByType(type, results) {
      const item = results.find((item) => item.type === type);
      return item ? parseInt(item.count, 10) : 0;
    }

    const customsCheck = new CustomListDto({
      음식점: findCountByType('음식점', subwayCustoms),
      카페: findCountByType('카페', subwayCustoms),
      술집: findCountByType('술집', subwayCustoms),
      쇼핑: findCountByType('쇼핑', subwayCustoms),
      문화: findCountByType('전시', subwayCustoms) + findCountByType('팝업', subwayCustoms),
      놀거리: findCountByType('놀거리', subwayCustoms),
    });

    return new ApiSubwayCheckGetResponseDto({ customs: [customsCheck] });
  }

  async subwayStationList(dto: ApiCourseSubwayListGetRequestQueryDto) {
    const subwayStationList = await this.subwayQueryRepository.subwayStationList(dto);
    if (isEmpty(subwayStationList)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const apiSubwayListGetResponseDto = plainToInstance(
      ApiSubwayListGetResponseDto,
      subwayStationList,
      { excludeExtraneousValues: true },
    );

    return { items: apiSubwayListGetResponseDto };
  }

  async subwayLineList() {
    const subwayLine = await this.subwayQueryRepository.findSubwayLine();

    const apiSubwayLineGetResponseDto = plainToInstance(
      ApiSubwayLineGetResponseDto,
      { subway: subwayLine.map((item) => ({ uuid: item.uuid, line: item.line })) },
      { excludeExtraneousValues: true },
    );

    return { items: apiSubwayLineGetResponseDto };
  }
}
