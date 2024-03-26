import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/auth/constants/error';
import { isEmpty } from 'src/commons/util/is/is-empty';
import { CustomListDto } from 'src/place/dto/subway.dto';
import { ApiSubwayGetCheckResponseDto } from './dto/api-subway-get-check-response.dto';
import { ApiSubwayGetLineResponseDto } from './dto/api-subway-get-line-response.dto';
import { ApiSubwayGetListResponseDto } from './dto/api-subway-get-list-response.dto';
import { SubwayQueryRepository } from './subway.query.repository';
import { StationInfo } from './interfaces/subway.interfaces';
import { PLACE_TYPE } from 'src/commons/enum/place-type-enum';

@Injectable()
export class SubwayService {
  constructor(private readonly subwayQueryRepository: SubwayQueryRepository) {}

  async subwayCustomsCheck(line_uuid: string, station_uuid: string) {
    const stationInfo: StationInfo = await this.subwayQueryRepository.findLineAndStation(
      line_uuid,
      station_uuid,
    );
    const subwayCustoms = await this.subwayQueryRepository.groupByCustoms(stationInfo);
    const subwayCurrentCulture = await this.subwayQueryRepository.findSubwayCurrentCulture(
      stationInfo,
    );

    function findCountByType(type, results) {
      const item = results.find((item) => item.type === type);
      return item ? parseInt(item.count, 10) : 0;
    }

    const customsCheck = new CustomListDto({
      RESTAURANT: findCountByType(PLACE_TYPE.RESTAURANT, subwayCustoms),
      CAFE: findCountByType(PLACE_TYPE.CAFE, subwayCustoms),
      BAR: findCountByType(PLACE_TYPE.BAR, subwayCustoms),
      SHOPPING: findCountByType(PLACE_TYPE.SHOPPING, subwayCustoms),
      CULTURE:
        findCountByType(PLACE_TYPE.EXHIBITION, subwayCurrentCulture) +
        findCountByType(PLACE_TYPE.POPUP, subwayCurrentCulture),
      ENTERTAINMENT: findCountByType(PLACE_TYPE.ENTERTAINMENT, subwayCustoms),
    });

    return new ApiSubwayGetCheckResponseDto({ items: customsCheck });
  }

  async subwayStationList(line_uuid: string) {
    const subwayStationList = await this.subwayQueryRepository.subwayStationList(line_uuid);
    if (isEmpty(subwayStationList)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const apiSubwayListGetResponseDto = plainToInstance(
      ApiSubwayGetListResponseDto,
      {
        items: subwayStationList.map((station) => ({ uuid: station.uuid, station: station.name })),
      },
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
