import { TestBed } from '@automock/jest';
import { ERROR } from 'src/commons/constants/error';
import { ApiSubwayGetCheckRequestQueryDto } from 'src/subway/dto/api-subway-get-check-request-query.dto';
import { ApiSubwayGetCheckResponseDto } from 'src/subway/dto/api-subway-get-check-response.dto';
import { ApiSubwayGetLineResponseDto } from 'src/subway/dto/api-subway-get-line-response.dto';
import { ApiSubwayGetListResponseDto } from 'src/subway/dto/api-subway-get-list-response.dto';
import { SubwayController } from 'src/subway/subway.controller';
import { SubwayService } from 'src/subway/subway.service';

describe('SubwayController', () => {
  let subwayController: SubwayController;
  let subwayService: jest.Mocked<SubwayService>;

  beforeEach(async () => {
    // Given
    const { unit, unitRef } = TestBed.create(SubwayController).compile();
    subwayController = unit;
    subwayService = unitRef.get(SubwayService);
    jest.clearAllMocks();
  });

  describe('subwayLineList', () => {
    it('should return subway line list', async () => {
      // Given
      const expectedResponse: ApiSubwayGetLineResponseDto = {
        items: [
          { uuid: 'l1', line: 'Line 1' },
          { uuid: 'l2', line: 'Line 2' },
        ],
      };
      jest.spyOn(subwayService, 'subwayLineList').mockResolvedValue(expectedResponse);
      // When
      const result = await subwayController.subwayLineList();
      // Then
      expect(subwayService.subwayLineList).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('subwayStationList', () => {
    it('should return subway station list for given line_uuid', async () => {
      // Given
      const lineUuid = 'line-uuid';
      const expectedResponse: ApiSubwayGetListResponseDto = {
        items: [
          { uuid: 's1', station: 'Station A' },
          { uuid: 's2', station: 'Station B' },
        ],
      };
      jest.spyOn(subwayService, 'subwayStationList').mockResolvedValue(expectedResponse);
      // When
      const result = await subwayController.subwayStationList(lineUuid);
      // Then
      expect(subwayService.subwayStationList).toHaveBeenCalledWith(lineUuid);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw NotFoundException if service throws error', async () => {
      // Given
      const lineUuid = 'line-uuid';
      jest
        .spyOn(subwayService, 'subwayStationList')
        .mockRejectedValue(new Error(ERROR.NOT_EXIST_DATA));
      // When & Then
      await expect(subwayController.subwayStationList(lineUuid)).rejects.toThrow(
        ERROR.NOT_EXIST_DATA,
      );
    });
  });

  describe('subwayCustomsCheck', () => {
    it('should return customs check response for given line_uuid, station_uuid and query dto', async () => {
      // Given
      const lineUuid = 'line-uuid';
      const stationUuid = 'station-uuid';
      const dto: ApiSubwayGetCheckRequestQueryDto = {
        place_uuids: ['p1', 'p2'],
      } as ApiSubwayGetCheckRequestQueryDto;
      const expectedResponse: ApiSubwayGetCheckResponseDto = {
        items: {},
      } as ApiSubwayGetCheckResponseDto;
      jest.spyOn(subwayService, 'subwayCustomsCheck').mockResolvedValue(expectedResponse);
      // When
      const result = await subwayController.subwayCustomsCheck(lineUuid, stationUuid, dto);
      // Then
      expect(subwayService.subwayCustomsCheck).toHaveBeenCalledWith(lineUuid, stationUuid, dto);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw NotFoundException if service throws error', async () => {
      // Given
      const lineUuid = 'line-uuid';
      const stationUuid = 'station-uuid';
      const dto: ApiSubwayGetCheckRequestQueryDto = {
        place_uuids: [],
      } as ApiSubwayGetCheckRequestQueryDto;
      jest
        .spyOn(subwayService, 'subwayCustomsCheck')
        .mockRejectedValue(new Error(ERROR.NOT_EXIST_DATA));
      // When & Then
      await expect(subwayController.subwayCustomsCheck(lineUuid, stationUuid, dto)).rejects.toThrow(
        ERROR.NOT_EXIST_DATA,
      );
    });
  });
});
