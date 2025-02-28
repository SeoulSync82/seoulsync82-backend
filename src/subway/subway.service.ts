import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PLACE_TYPE } from 'src/commons/enum/place-type-enum';
import { findCountByType } from 'src/commons/helpers/place-count-by-type.helper';
import { isEmpty } from 'src/commons/util/is/is-empty';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { ApiSubwayGetCheckRequestQueryDto } from 'src/subway/dto/api-subway-get-check-request-query.dto';
import { ApiSubwayGetCheckResponseDto } from 'src/subway/dto/api-subway-get-check-response.dto';
import { ApiSubwayGetLineResponseDto } from 'src/subway/dto/api-subway-get-line-response.dto';
import { ApiSubwayGetListResponseDto } from 'src/subway/dto/api-subway-get-list-response.dto';
import { SubwayCustomListDto } from 'src/subway/dto/subway-custom-list.dto';
import { StationInfo } from 'src/subway/interfaces/subway.interfaces';
import { SubwayQueryRepository } from 'src/subway/subway.query.repository';
import { ERROR } from '../commons/constants/error';

@Injectable()
export class SubwayService {
  constructor(
    private readonly subwayQueryRepository: SubwayQueryRepository,
    private readonly placeQueryRepository: PlaceQueryRepository,
  ) {}

  async subwayCustomsCheck(
    lineUuid: string,
    stationUuid: string,
    dto: ApiSubwayGetCheckRequestQueryDto,
  ): Promise<ApiSubwayGetCheckResponseDto> {
    // 1. Retrieve station info first
    const stationInfo: StationInfo = await this.subwayQueryRepository.findLineAndStation(
      lineUuid,
      stationUuid,
    );
    // 2. 병렬로 호출 (customs, current culture, 이미 추가된 장소)
    const [subwayCustoms, subwayCurrentCulture, alreadyAddedPlaces] = await Promise.all([
      this.subwayQueryRepository.groupByCustoms(stationInfo),
      this.subwayQueryRepository.findSubwayCurrentCulture(stationInfo),
      this.placeQueryRepository.findPlacesWithUuids(dto.place_uuids),
    ]);

    // 3. Updated subway customs
    const updatedSubwayCustoms = subwayCustoms.map((custom) => {
      const addedCount = alreadyAddedPlaces.filter(
        (place) => place.place_type === custom.type,
      ).length;
      return { ...custom, count: Number(custom.count) - addedCount };
    });

    // 4. Compose customs check
    const customsCheck = new SubwayCustomListDto({
      RESTAURANT: findCountByType(PLACE_TYPE.RESTAURANT, updatedSubwayCustoms),
      CAFE: findCountByType(PLACE_TYPE.CAFE, updatedSubwayCustoms),
      BAR: findCountByType(PLACE_TYPE.BAR, updatedSubwayCustoms),
      SHOPPING: findCountByType(PLACE_TYPE.SHOPPING, updatedSubwayCustoms),
      CULTURE:
        findCountByType(PLACE_TYPE.EXHIBITION, subwayCurrentCulture) +
        findCountByType(PLACE_TYPE.POPUP, subwayCurrentCulture),
      ENTERTAINMENT: findCountByType(PLACE_TYPE.ENTERTAINMENT, updatedSubwayCustoms),
    });

    return new ApiSubwayGetCheckResponseDto({ items: customsCheck });
  }

  async subwayStationList(lineUuid: string): Promise<ApiSubwayGetListResponseDto> {
    const subwayStationList = await this.subwayQueryRepository.subwayStationList(lineUuid);
    if (isEmpty(subwayStationList)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    return plainToInstance(
      ApiSubwayGetListResponseDto,
      {
        items: subwayStationList.map((station) => ({ uuid: station.uuid, station: station.name })),
      },
      { excludeExtraneousValues: true },
    );
  }

  async subwayLineList(): Promise<ApiSubwayGetLineResponseDto> {
    const subwayLine = await this.subwayQueryRepository.findSubwayLine();

    return plainToInstance(
      ApiSubwayGetLineResponseDto,
      { items: subwayLine.map((item) => ({ uuid: item.uuid, line: item.line })) },
      { excludeExtraneousValues: true },
    );
  }
}
