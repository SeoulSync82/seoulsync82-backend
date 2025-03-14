import { TestBed } from '@automock/jest';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PLACE_TYPE } from 'src/commons/enum/place-type-enum';
import { findCountByType } from 'src/commons/helpers/place-count-by-type.helper';
import { PlaceEntity } from 'src/entities/place.entity';
import { SubwayLineEntity } from 'src/entities/subway_line.entity';
import { SubwayStationEntity } from 'src/entities/subway_station.entity';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { ApiSubwayGetCheckRequestQueryDto } from 'src/subway/dto/api-subway-get-check-request-query.dto';
import { ApiSubwayGetCheckResponseDto } from 'src/subway/dto/api-subway-get-check-response.dto';
import { ApiSubwayGetLineResponseDto } from 'src/subway/dto/api-subway-get-line-response.dto';
import { ApiSubwayGetListResponseDto } from 'src/subway/dto/api-subway-get-list-response.dto';
import { SubwayCustomListDto } from 'src/subway/dto/subway-custom-list.dto';
import { StationInfo } from 'src/subway/interfaces/subway.interfaces';
import { SubwayQueryRepository } from 'src/subway/subway.query.repository';
import { SubwayService } from 'src/subway/subway.service';

describe('SubwayService', () => {
  let service: SubwayService;
  let subwayQueryRepository: jest.Mocked<SubwayQueryRepository>;
  let placeQueryRepository: jest.Mocked<PlaceQueryRepository>;

  beforeEach(async () => {
    // Given
    const { unit, unitRef } = TestBed.create(SubwayService).compile();
    service = unit;
    subwayQueryRepository = unitRef.get(SubwayQueryRepository);
    placeQueryRepository = unitRef.get(PlaceQueryRepository);
    jest.clearAllMocks();
  });

  describe('subwayCustomsCheck', () => {
    const lineUuid = 'line-uuid';
    const stationUuid = 'station-uuid';
    const dto: ApiSubwayGetCheckRequestQueryDto = {
      place_uuids: ['p1', 'p2'],
    } as ApiSubwayGetCheckRequestQueryDto;

    it('should return customs check response with updated counts', async () => {
      // Given
      const stationInfo: StationInfo = { line: '1호선', station: 'Station A' };
      jest.spyOn(subwayQueryRepository, 'findLineAndStation').mockResolvedValue(stationInfo);
      const subwayCustoms = [
        { type: PLACE_TYPE.RESTAURANT, count: '8' },
        { type: PLACE_TYPE.CAFE, count: '5' },
      ];
      const subwayCurrentCulture = [
        { type: PLACE_TYPE.EXHIBITION, count: '2' },
        { type: PLACE_TYPE.POPUP, count: '3' },
      ];
      const alreadyAddedPlaces = [
        { uuid: 's1', place_name: 'Station A' },
        { uuid: 's2', place_name: 'Station B' },
      ] as PlaceEntity[];
      jest.spyOn(subwayQueryRepository, 'groupByCustoms').mockResolvedValue(subwayCustoms);
      jest
        .spyOn(subwayQueryRepository, 'findSubwayCurrentCulture')
        .mockResolvedValue(subwayCurrentCulture);
      jest.spyOn(placeQueryRepository, 'findPlacesWithUuids').mockResolvedValue(alreadyAddedPlaces);

      // When
      const result = await service.subwayCustomsCheck(lineUuid, stationUuid, dto);

      // Then
      const expectedCustoms = new SubwayCustomListDto({
        RESTAURANT: findCountByType(PLACE_TYPE.RESTAURANT, [
          { type: PLACE_TYPE.RESTAURANT, count: 8 },
          { type: PLACE_TYPE.CAFE, count: 5 },
        ]),
        CAFE: findCountByType(PLACE_TYPE.CAFE, [
          { type: PLACE_TYPE.RESTAURANT, count: 8 },
          { type: PLACE_TYPE.CAFE, count: 5 },
        ]),
        BAR: findCountByType(PLACE_TYPE.BAR, [
          { type: PLACE_TYPE.RESTAURANT, count: 8 },
          { type: PLACE_TYPE.CAFE, count: 5 },
        ]),
        SHOPPING: findCountByType(PLACE_TYPE.SHOPPING, [
          { type: PLACE_TYPE.RESTAURANT, count: 8 },
          { type: PLACE_TYPE.CAFE, count: 5 },
        ]),
        CULTURE:
          findCountByType(PLACE_TYPE.EXHIBITION, subwayCurrentCulture) +
          findCountByType(PLACE_TYPE.POPUP, subwayCurrentCulture),
        ENTERTAINMENT: findCountByType(PLACE_TYPE.ENTERTAINMENT, [
          { type: PLACE_TYPE.RESTAURANT, count: 8 },
          { type: PLACE_TYPE.CAFE, count: 5 },
        ]),
      });
      const expectedResponse = new ApiSubwayGetCheckResponseDto({ items: expectedCustoms });
      expect(result).toMatchObject(expectedResponse);
    });
  });

  describe('subwayStationList', () => {
    it('should throw NotFoundException when station list is empty', async () => {
      // Given
      const lineUuid = 'line-uuid';
      jest.spyOn(subwayQueryRepository, 'subwayStationList').mockResolvedValue([]);
      // When & Then
      await expect(service.subwayStationList(lineUuid)).rejects.toThrow(NotFoundException);
    });

    it('should return subway station list when available', async () => {
      // Given
      const lineUuid = 'line-uuid';
      const stationList = [
        { uuid: 's1', name: 'Station A' },
        { uuid: 's2', name: 'Station B' },
      ] as SubwayStationEntity[];
      jest.spyOn(subwayQueryRepository, 'subwayStationList').mockResolvedValue(stationList);
      // When
      const result = await service.subwayStationList(lineUuid);
      // Then
      const expected = plainToInstance(
        ApiSubwayGetListResponseDto,
        { items: stationList.map((station) => ({ uuid: station.uuid, station: station.name })) },
        { excludeExtraneousValues: true },
      );
      expect(result).toMatchObject(expected);
    });
  });

  describe('subwayLineList', () => {
    it('should return subway line list', async () => {
      // Given
      const subwayLine = [
        { uuid: 'l1', line: 'Line 1' },
        { uuid: 'l2', line: 'Line 2' },
      ] as SubwayLineEntity[];
      jest.spyOn(subwayQueryRepository, 'findSubwayLine').mockResolvedValue(subwayLine);
      // When
      const result = await service.subwayLineList();
      // Then
      const expected = plainToInstance(
        ApiSubwayGetLineResponseDto,
        { items: subwayLine.map((item) => ({ uuid: item.uuid, line: item.line })) },
        { excludeExtraneousValues: true },
      );
      expect(result).toMatchObject(expected);
    });
  });
});
