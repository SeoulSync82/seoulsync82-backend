import { TestBed } from '@automock/jest';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PlaceEntity } from 'src/entities/place.entity';
import { ApiPlaceGetCultureDetailResponseDto } from 'src/place/dto/api-place-get-culture-detail-response.dto';
import { ApiPlaceGetCultureRequestQueryDto } from 'src/place/dto/api-place-get-culture-request-query.dto';
import { ApiPlaceGetCultureResponseDto } from 'src/place/dto/api-place-get-culture-response.dto';
import { ApiPlaceGetDetailResponseDto } from 'src/place/dto/api-place-get-detail-response.dto';
import { ApiPlaceGetExhibitionRequestQueryDto } from 'src/place/dto/api-place-get-exhibition-request-query.dto';
import { ApiPlaceGetExhibitionResponseDto } from 'src/place/dto/api-place-get-exhibition-response.dto';
import { ApiPlaceGetPopupRequestQueryDto } from 'src/place/dto/api-place-get-popup-request-query.dto';
import { ApiPlaceGetPopupResponseDto } from 'src/place/dto/api-place-get-popup-response.dto';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { PlaceService } from './place.service';

describe('PlaceService', () => {
  let placeService: PlaceService;
  let placeQueryRepository: jest.Mocked<PlaceQueryRepository>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(PlaceService).compile();
    placeService = unit;
    placeQueryRepository = unitRef.get(PlaceQueryRepository);
    jest.clearAllMocks();
  });

  const sampleCultureEntities: PlaceEntity[] = [
    {
      id: 1,
      uuid: 'culture-1',
      place_name: 'Culture 1',
      place_type: 'culture',
      operation_time: '09:00-18:00',
    },
    {
      id: 2,
      uuid: 'culture-2',
      place_name: 'Culture 2',
      place_type: 'culture',
      operation_time: '09:00-18:00',
    },
  ] as PlaceEntity[];

  const sampleExhibitionItems: PlaceEntity[] = [
    {
      id: 3,
      uuid: 'exh-1',
      place_name: 'Exhibition 1',
      place_type: 'exhibition',
      operation_time: '10:00-20:00',
    },
    {
      id: 4,
      uuid: 'exh-2',
      place_name: 'Exhibition 2',
      place_type: 'exhibition',
      operation_time: '10:00-20:00',
    },
  ] as PlaceEntity[];

  const samplePopupItems: PlaceEntity[] = [
    {
      id: 5,
      uuid: 'popup-1',
      place_name: 'Popup 1',
      place_type: 'popup',
      operation_time: '11:00-19:00',
    },
    {
      id: 6,
      uuid: 'popup-2',
      place_name: 'Popup 2',
      place_type: 'popup',
      operation_time: '11:00-19:00',
    },
  ] as PlaceEntity[];

  const samplePlaceDetail: PlaceEntity = {
    id: 7,
    uuid: 'place-1',
    place_name: 'Place Detail',
    place_type: 'detail',
    operation_time: '08:00-22:00',
  } as PlaceEntity;

  describe('findCultureList', () => {
    it('should return empty list when no culture entities are found', async () => {
      // Given
      const dto: ApiPlaceGetCultureRequestQueryDto = {} as ApiPlaceGetCultureRequestQueryDto;
      jest.spyOn(placeQueryRepository, 'findList').mockResolvedValue([]);
      // When
      const result = await placeService.findCultureList(dto);
      // Then
      expect(result).toEqual({ items: [] });
      expect(placeQueryRepository.findList).toHaveBeenCalledWith(dto);
    });

    it('should return transformed culture list when culture entities are found', async () => {
      // Given
      const dto: ApiPlaceGetCultureRequestQueryDto = {} as ApiPlaceGetCultureRequestQueryDto;
      jest.spyOn(placeQueryRepository, 'findList').mockResolvedValue(sampleCultureEntities);
      const expectedItems = plainToInstance(ApiPlaceGetCultureResponseDto, sampleCultureEntities, {
        excludeExtraneousValues: true,
      });
      // When
      const result = await placeService.findCultureList(dto);
      // Then
      expect(result).toEqual({ items: expectedItems });
      expect(placeQueryRepository.findList).toHaveBeenCalledWith(dto);
    });
  });

  describe('findCultureDetail', () => {
    it('should throw NotFoundException when culture entity is not found', async () => {
      // Given
      const uuid = 'culture-unknown';
      jest.spyOn(placeQueryRepository, 'findOne').mockResolvedValue(null);
      // When & Then
      await expect(placeService.findCultureDetail(uuid)).rejects.toThrow(NotFoundException);
      expect(placeQueryRepository.findOne).toHaveBeenCalledWith(uuid);
    });

    it('should return transformed culture detail when culture entity is found', async () => {
      // Given
      const uuid = 'culture-1';
      jest.spyOn(placeQueryRepository, 'findOne').mockResolvedValue(sampleCultureEntities[0]);
      const expectedDetail = plainToInstance(
        ApiPlaceGetCultureDetailResponseDto,
        sampleCultureEntities[0],
        {
          excludeExtraneousValues: true,
        },
      );
      // When
      const result = await placeService.findCultureDetail(uuid);
      // Then
      expect(result).toEqual(expectedDetail);
      expect(placeQueryRepository.findOne).toHaveBeenCalledWith(uuid);
    });
  });

  describe('findExhibitionList', () => {
    it('should return empty exhibition list when total count is zero', async () => {
      // Given
      const dto: ApiPlaceGetExhibitionRequestQueryDto = {} as ApiPlaceGetExhibitionRequestQueryDto;
      jest.spyOn(placeQueryRepository, 'countExhibition').mockResolvedValue(0);
      // When
      const result = await placeService.findExhibitionList(dto);
      // Then
      expect(result).toEqual({ items: [], total_count: 0, next_page: null });
      expect(placeQueryRepository.countExhibition).toHaveBeenCalled();
    });

    it('should return transformed exhibition list when exhibitions exist', async () => {
      // Given
      const dto: ApiPlaceGetExhibitionRequestQueryDto = {} as ApiPlaceGetExhibitionRequestQueryDto;
      const totalCount = 2;
      jest.spyOn(placeQueryRepository, 'countExhibition').mockResolvedValue(totalCount);
      jest.spyOn(placeQueryRepository, 'findExhibitionList').mockResolvedValue({
        items: sampleExhibitionItems,
        nextCursor: 'cursor-123',
      });
      const expectedItems = plainToInstance(
        ApiPlaceGetExhibitionResponseDto,
        sampleExhibitionItems,
        {
          excludeExtraneousValues: true,
        },
      );
      // When
      const result = await placeService.findExhibitionList(dto);
      // Then
      expect(result).toEqual({
        items: expectedItems,
        total_count: totalCount,
        next_page: 'cursor-123',
      });
      expect(placeQueryRepository.countExhibition).toHaveBeenCalled();
      expect(placeQueryRepository.findExhibitionList).toHaveBeenCalledWith(dto);
    });
  });

  describe('findPopupList', () => {
    it('should return empty popup list when total count is zero', async () => {
      // Given
      const dto: ApiPlaceGetPopupRequestQueryDto = {} as ApiPlaceGetPopupRequestQueryDto;
      jest.spyOn(placeQueryRepository, 'countPopup').mockResolvedValue(0);
      // When
      const result = await placeService.findPopupList(dto);
      // Then
      expect(result).toEqual({ items: [], total_count: 0, next_page: null });
      expect(placeQueryRepository.countPopup).toHaveBeenCalled();
    });

    it('should return transformed popup list when popups exist', async () => {
      // Given
      const dto: ApiPlaceGetPopupRequestQueryDto = {} as ApiPlaceGetPopupRequestQueryDto;
      const totalCount = 2;
      jest.spyOn(placeQueryRepository, 'countPopup').mockResolvedValue(totalCount);
      jest.spyOn(placeQueryRepository, 'findPopupList').mockResolvedValue({
        items: samplePopupItems,
        nextCursor: 'cursor-456',
      });
      const expectedItems = plainToInstance(ApiPlaceGetPopupResponseDto, samplePopupItems, {
        excludeExtraneousValues: true,
      });
      // When
      const result = await placeService.findPopupList(dto);
      // Then
      expect(result).toEqual({
        items: expectedItems,
        total_count: totalCount,
        next_page: 'cursor-456',
      });
      expect(placeQueryRepository.countPopup).toHaveBeenCalled();
      expect(placeQueryRepository.findPopupList).toHaveBeenCalledWith(dto);
    });
  });

  describe('findPlaceDetail', () => {
    it('should throw NotFoundException when place detail is not found', async () => {
      // Given
      const uuid = 'place-unknown';
      jest.spyOn(placeQueryRepository, 'findOne').mockResolvedValue(null);
      // When & Then
      await expect(placeService.findPlaceDetail(uuid)).rejects.toThrow(NotFoundException);
      expect(placeQueryRepository.findOne).toHaveBeenCalledWith(uuid);
    });

    it('should return transformed place detail when place detail is found', async () => {
      // Given
      const uuid = 'place-1';
      jest.spyOn(placeQueryRepository, 'findOne').mockResolvedValue(samplePlaceDetail);
      const expectedDetail = plainToInstance(ApiPlaceGetDetailResponseDto, samplePlaceDetail, {
        excludeExtraneousValues: true,
      });
      // When
      const result = await placeService.findPlaceDetail(uuid);
      // Then
      expect(result).toEqual(expectedDetail);
      expect(placeQueryRepository.findOne).toHaveBeenCalledWith(uuid);
    });
  });
});
