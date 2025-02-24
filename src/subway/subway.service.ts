import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/commons/constants/error';
import { PLACE_TYPE } from 'src/commons/enum/place-type-enum';
import { isEmpty } from 'src/commons/util/is/is-empty';
import { CustomListDto } from 'src/place/dto/subway.dto';
import { PlaceQueryRepository } from '../place/place.query.repository';
import { ApiSubwayGetCheckRequestQueryDto } from './dto/api-subway-get-check-request-query.dto';
import { ApiSubwayGetCheckResponseDto } from './dto/api-subway-get-check-response.dto';
import { ApiSubwayGetLineResponseDto } from './dto/api-subway-get-line-response.dto';
import { ApiSubwayGetListResponseDto } from './dto/api-subway-get-list-response.dto';
import { StationInfo } from './interfaces/subway.interfaces';
import { SubwayQueryRepository } from './subway.query.repository';

@Injectable()
export class SubwayService {
  constructor(
    private readonly subwayQueryRepository: SubwayQueryRepository,
    private readonly placeQueryRepository: PlaceQueryRepository,
  ) {}

  async subwayCustomsCheck(
    line_uuid: string,
    station_uuid: string,
    dto: ApiSubwayGetCheckRequestQueryDto,
  ) {
    const stationInfo: StationInfo = await this.subwayQueryRepository.findLineAndStation(
      line_uuid,
      station_uuid,
    );
    let subwayCustoms = await this.subwayQueryRepository.groupByCustoms(stationInfo);
    const subwayCurrentCulture = await this.subwayQueryRepository.findSubwayCurrentCulture(
      stationInfo,
    );

    const alreadyAddedPlaces = await this.placeQueryRepository.findPlacesWithUuids(dto.place_uuids);

    alreadyAddedPlaces.forEach((place) => {
      const targetCustom = subwayCustoms.find((custom) => custom.type === place.place_type);
      targetCustom.count = parseInt(targetCustom.count) - 1;
    });

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
