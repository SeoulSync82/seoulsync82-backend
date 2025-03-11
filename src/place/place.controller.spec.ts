import { TestBed } from '@automock/jest';
import { CursorPaginatedResponseDto } from 'src/commons/dtos/cursor-paginated-response.dto';
import { ListResponseDto } from 'src/commons/dtos/list-response.dto';
import { ApiPlaceGetCultureDetailResponseDto } from 'src/place/dto/api-place-get-culture-detail-response.dto';
import { ApiPlaceGetCultureRequestQueryDto } from 'src/place/dto/api-place-get-culture-request-query.dto';
import { ApiPlaceGetDetailResponseDto } from 'src/place/dto/api-place-get-detail-response.dto';
import { ApiPlaceGetExhibitionRequestQueryDto } from 'src/place/dto/api-place-get-exhibition-request-query.dto';
import { ApiPlaceGetPopupRequestQueryDto } from 'src/place/dto/api-place-get-popup-request-query.dto';
import { PlaceService } from 'src/place/place.service';
import { PlaceController } from './place.controller';

describe('PlaceController', () => {
  let placeController: PlaceController;
  let placeService: jest.Mocked<PlaceService>;

  beforeEach(async () => {
    // Given
    const { unit, unitRef } = TestBed.create(PlaceController).compile();
    placeController = unit;
    placeService = unitRef.get(PlaceService);
    jest.clearAllMocks();
  });

  describe('findCultureList', () => {
    it('should return list response when culture list is retrieved', async () => {
      // Given
      const dto = { size: 10 } as ApiPlaceGetCultureRequestQueryDto;
      const fakeResponse: ListResponseDto<any> = {
        items: [{ uuid: 'c1', place_name: 'Culture 1' }],
      };
      jest.spyOn(placeService, 'findCultureList').mockResolvedValue(fakeResponse);
      // When
      const result = await placeController.findCultureList(dto);
      // Then
      expect(placeService.findCultureList).toHaveBeenCalledWith(dto);
      expect(result).toEqual(fakeResponse);
    });
  });

  describe('findCultureDetail', () => {
    it('should return culture detail when given valid uuid', async () => {
      // Given
      const uuid = 'uuid1';
      const fakeResponse: ApiPlaceGetCultureDetailResponseDto = {
        uuid,
      } as ApiPlaceGetCultureDetailResponseDto;
      jest.spyOn(placeService, 'findCultureDetail').mockResolvedValue(fakeResponse);
      // When
      const result = await placeController.findCultureDetail(uuid);
      // Then
      expect(placeService.findCultureDetail).toHaveBeenCalledWith(uuid);
      expect(result).toEqual(fakeResponse);
    });
  });

  describe('findExhibitionList', () => {
    it('should return exhibition list with paging info', async () => {
      // Given
      const dto = {
        size: 5,
        order: 'latest',
        next_page: null,
      } as ApiPlaceGetExhibitionRequestQueryDto;
      const fakeResponse: CursorPaginatedResponseDto<any> = {
        items: [{ uuid: 'e1', title: 'Exhibition 1' }],
        next_page: 'cursor1',
      };
      jest.spyOn(placeService, 'findExhibitionList').mockResolvedValue(fakeResponse);
      // When
      const result = await placeController.findExhibitionList(dto);
      // Then
      expect(placeService.findExhibitionList).toHaveBeenCalledWith(dto);
      expect(result).toEqual(fakeResponse);
    });
  });

  describe('findPopupList', () => {
    it('should return popup list with paging info', async () => {
      // Given
      const dto = { size: 5, order: 'latest', next_page: null } as ApiPlaceGetPopupRequestQueryDto;
      const fakeResponse: CursorPaginatedResponseDto<any> = {
        items: [{ uuid: 'p1', title: 'Popup 1' }],
        next_page: 'cursor2',
      };
      jest.spyOn(placeService, 'findPopupList').mockResolvedValue(fakeResponse);
      // When
      const result = await placeController.findPopupList(dto);
      // Then
      expect(placeService.findPopupList).toHaveBeenCalledWith(dto);
      expect(result).toEqual(fakeResponse);
    });
  });

  describe('findPlaceDetail', () => {
    it('should return place detail when given valid uuid', async () => {
      // Given
      const uuid = 'uuid1';
      const fakeResponse: ApiPlaceGetDetailResponseDto = {
        uuid,
        place_name: 'Place 1',
      } as ApiPlaceGetDetailResponseDto;
      jest.spyOn(placeService, 'findPlaceDetail').mockResolvedValue(fakeResponse);
      // When
      const result = await placeController.findPlaceDetail(uuid);
      // Then
      expect(placeService.findPlaceDetail).toHaveBeenCalledWith(uuid);
      expect(result).toEqual(fakeResponse);
    });
  });
});
