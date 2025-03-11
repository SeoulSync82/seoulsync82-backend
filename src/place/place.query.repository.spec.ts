import { TestBed } from '@automock/jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PLACE_TYPE } from 'src/commons/enum/place-type-enum';
import { CursorPaginationHelper } from 'src/commons/helpers/cursor.helper';
import { ApiCourseGetPlaceCustomizeRequestQueryDto } from 'src/course/dto/api-course-get-place-customize-request-query.dto';
import { ApiCourseGetRecommendRequestQueryDto } from 'src/course/dto/api-course-get-recommend-request-query.dto';
import { ApiCoursePostRecommendRequestBodyDto } from 'src/course/dto/api-course-post-recommend-request-body.dto';
import { PlaceEntity } from 'src/entities/place.entity';
import { ApiPlaceGetCultureRequestQueryDto } from 'src/place/dto/api-place-get-culture-request-query.dto';
import { ApiPlaceGetExhibitionRequestQueryDto } from 'src/place/dto/api-place-get-exhibition-request-query.dto';
import { ApiPlaceGetPopupRequestQueryDto } from 'src/place/dto/api-place-get-popup-request-query.dto';
import { ApiSearchGetRequestQueryDto } from 'src/search/dto/api-search-get-request-query.dto';
import { Brackets, FindOptionsOrder, In, LessThan, Like, MoreThan, Repository } from 'typeorm';
import { PlaceQueryRepository } from './place.query.repository';

describe('PlaceQueryRepository', () => {
  let placeQueryRepository: PlaceQueryRepository;
  let repository: jest.Mocked<Repository<PlaceEntity>>;

  beforeEach(async () => {
    // Given
    const { unit, unitRef } = TestBed.create(PlaceQueryRepository).compile();
    placeQueryRepository = unit;
    repository = unitRef.get(getRepositoryToken(PlaceEntity) as string);
    jest.clearAllMocks();
  });

  describe('findList', () => {
    it('should return list of culture places when given valid dto', async () => {
      // Given
      const dto = { size: 5 } as ApiPlaceGetCultureRequestQueryDto;
      const fakePlaces: PlaceEntity[] = [
        { uuid: 'p1' } as PlaceEntity,
        { uuid: 'p2' } as PlaceEntity,
      ];
      const fakeQb = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(fakePlaces),
      };
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(fakeQb as any);
      // When
      const result = await placeQueryRepository.findList(dto);
      // Then
      expect(fakeQb.select).toHaveBeenCalledWith('place');
      expect(fakeQb.where).toHaveBeenCalledWith('place.place_type IN (:...types)', {
        types: ['전시', '팝업'],
      });
      expect(fakeQb.andWhere).toHaveBeenCalledWith('place.end_date > :now', {
        now: expect.any(Date),
      });
      expect(fakeQb.orderBy).toHaveBeenCalledWith('start_date', 'DESC');
      expect(fakeQb.limit).toHaveBeenCalledWith(dto.size);
      expect(result).toEqual(fakePlaces);
    });
  });

  describe('findOne', () => {
    it('should return a place entity when found by uuid', async () => {
      // Given
      const fakePlace = { uuid: 'p1' } as PlaceEntity;
      repository.findOne.mockResolvedValue(fakePlace);
      // When
      const result = await placeQueryRepository.findOne('p1');
      // Then
      expect(repository.findOne).toHaveBeenCalledWith({ where: { uuid: 'p1' } });
      expect(result).toEqual(fakePlace);
    });
  });

  describe('findExhibitionList', () => {
    it('should return exhibition list with latest order (DESC) when order is "latest"', async () => {
      // Given
      const dto = {
        size: 2,
        order: 'latest',
        next_page: null,
      } as ApiPlaceGetExhibitionRequestQueryDto;
      const fakeResults: PlaceEntity[] = [
        { uuid: 'p1' } as PlaceEntity,
        { uuid: 'p2' } as PlaceEntity,
        { uuid: 'p3' } as PlaceEntity,
      ];
      const fakeQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(fakeResults),
      };
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(fakeQb as any);
      jest.spyOn(CursorPaginationHelper, 'applyCursor').mockImplementation(() => {});
      jest.spyOn(CursorPaginationHelper, 'generateCursor').mockReturnValue('cursor123');
      // When
      const result = await placeQueryRepository.findExhibitionList(dto);
      // Then
      expect(fakeQb.orderBy).toHaveBeenCalledWith('place.start_date', 'DESC');
      expect(fakeQb.addOrderBy).toHaveBeenCalledWith('place.id', 'DESC');
      expect(fakeQb.take).toHaveBeenCalledWith(dto.size + 1);
      expect(result).toEqual({ items: fakeResults.slice(0, -1), nextCursor: 'cursor123' });
    });

    it('should return exhibition list with ascending order when order is not "latest"', async () => {
      // Given
      const dto = {
        size: 2,
        order: 'deadline',
        next_page: null,
      } as ApiPlaceGetExhibitionRequestQueryDto;
      const fakeResults: PlaceEntity[] = [
        { uuid: 'p1' } as PlaceEntity,
        { uuid: 'p2' } as PlaceEntity,
      ];
      const fakeQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(fakeResults),
      };
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(fakeQb as any);
      jest.spyOn(CursorPaginationHelper, 'applyCursor').mockImplementation(() => {});
      // When
      const result = await placeQueryRepository.findExhibitionList(dto);
      // Then
      expect(fakeQb.orderBy).toHaveBeenCalledWith('place.end_date', 'ASC');
      expect(fakeQb.addOrderBy).toHaveBeenCalledWith('place.id', 'ASC');
      expect(result).toEqual({ items: fakeResults, nextCursor: null });
    });
  });

  describe('findPopupList', () => {
    it('should return popup list with latest order (DESC) when order is "latest"', async () => {
      // Given
      const dto = { size: 2, order: 'latest', next_page: null } as ApiPlaceGetPopupRequestQueryDto;
      const fakeResults: PlaceEntity[] = [
        { uuid: 'p1' } as PlaceEntity,
        { uuid: 'p2' } as PlaceEntity,
        { uuid: 'p3' } as PlaceEntity,
      ];
      const fakeQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(fakeResults),
      };
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(fakeQb as any);
      jest.spyOn(CursorPaginationHelper, 'applyCursor').mockImplementation(() => {});
      jest.spyOn(CursorPaginationHelper, 'generateCursor').mockReturnValue('cursor456');
      // When
      const result = await placeQueryRepository.findPopupList(dto);
      // Then
      expect(fakeQb.orderBy).toHaveBeenCalledWith('place.start_date', 'DESC');
      expect(fakeQb.addOrderBy).toHaveBeenCalledWith('place.id', 'DESC');
      expect(result).toEqual({ items: fakeResults.slice(0, -1), nextCursor: 'cursor456' });
    });

    it('should return popup list with ascending order when order is not "latest"', async () => {
      // Given
      const dto = {
        size: 2,
        order: 'deadline',
        next_page: null,
      } as ApiPlaceGetPopupRequestQueryDto;
      const fakeResults: PlaceEntity[] = [
        { uuid: 'p1' } as PlaceEntity,
        { uuid: 'p2' } as PlaceEntity,
      ];
      const fakeQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(fakeResults),
      };
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(fakeQb as any);
      jest.spyOn(CursorPaginationHelper, 'applyCursor').mockImplementation(() => {});
      // When
      const result = await placeQueryRepository.findPopupList(dto);
      // Then
      expect(fakeQb.orderBy).toHaveBeenCalledWith('place.end_date', 'ASC');
      expect(fakeQb.addOrderBy).toHaveBeenCalledWith('place.id', 'ASC');
      expect(result).toEqual({ items: fakeResults, nextCursor: null });
    });
  });

  describe('countPopup', () => {
    it('should return count of popup places', async () => {
      // Given
      const countVal = 5;
      repository.count.mockResolvedValue(countVal);
      // When
      const result = await placeQueryRepository.countPopup();
      // Then
      expect(repository.count).toHaveBeenCalledWith({
        where: { place_type: '팝업', end_date: MoreThan(expect.any(Date)) },
      });
      expect(result).toBe(countVal);
    });
  });

  describe('countExhibition', () => {
    it('should return count of exhibition places', async () => {
      // Given
      const countVal = 3;
      repository.count.mockResolvedValue(countVal);
      // When
      const result = await placeQueryRepository.countExhibition();
      // Then
      expect(repository.count).toHaveBeenCalledWith({
        where: { place_type: '전시', end_date: MoreThan(expect.any(Date)) },
      });
      expect(result).toBe(countVal);
    });
  });

  describe('search', () => {
    it('should return search results for culture type', async () => {
      // Given
      const dto = {
        search: 'test',
        last_id: 10,
        size: 5,
        place_type: 'culture',
      } as ApiSearchGetRequestQueryDto;
      const fakeResults: PlaceEntity[] = [{ uuid: 'p1' } as PlaceEntity];
      repository.find.mockResolvedValue(fakeResults);
      // When
      const result = await placeQueryRepository.search(dto);
      // Then
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          place_name: Like(`%${dto.search}%`),
          id: LessThan(dto.last_id),
          place_type: In(['전시회', '팝업']),
        },
        order: { start_date: 'DESC' } as FindOptionsOrder<PlaceEntity>,
        take: dto.size,
      });
      expect(result).toEqual(fakeResults);
    });

    it('should return search results for non-culture type', async () => {
      // Given
      const dto = {
        search: 'cafe',
        last_id: 0,
        size: 5,
        place_type: 'other',
      } as ApiSearchGetRequestQueryDto;
      const fakeResults: PlaceEntity[] = [{ uuid: 'p2' } as PlaceEntity];
      repository.find.mockResolvedValue(fakeResults);
      // When
      const result = await placeQueryRepository.search(dto);
      // Then
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          place_name: Like(`%${dto.search}%`),
          place_type: In(['음식점', '카페', '술집']),
        },
        order: { review_count: 'DESC' } as FindOptionsOrder<PlaceEntity>,
        take: dto.size,
      });
      expect(result).toEqual(fakeResults);
    });
  });

  describe('old_findSubwayPlaceList', () => {
    it('should return subway place list using old query builder', async () => {
      // Given
      const customs = ['TYPE1', 'TYPE2'];
      const dto = {
        line: 'Line 1',
        subway: 'Subway A',
        customs: [],
      } as ApiCoursePostRecommendRequestBodyDto;
      const fakeResults: PlaceEntity[] = [{ uuid: 'p1' } as PlaceEntity];
      const fakeQb = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(fakeResults),
      };
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(fakeQb as any);
      // When
      const result = await placeQueryRepository.old_findSubwayPlaceList(customs, dto);
      // Then
      expect(fakeQb.innerJoinAndSelect).toHaveBeenCalledWith('p.subways', 's');
      expect(fakeQb.where).toHaveBeenCalledWith('s.line = :line', { line: dto.line });
      expect(fakeQb.andWhere).toHaveBeenCalledWith('s.name = :name', { name: dto.subway });
      expect(fakeQb.andWhere).toHaveBeenCalledWith('s.place_type IN (:...types)', {
        types: customs,
      });
      expect(fakeQb.andWhere).toHaveBeenCalledWith('s.kakao_rating = :rating', { rating: 1 });
      expect(result).toEqual(fakeResults);
    });
  });

  describe('findSubwayPlaceList', () => {
    it('should return subway place list with theme filtering when theme_uuid is provided', async () => {
      // Given
      const dto = { theme_uuid: 'theme-uuid' } as ApiCourseGetRecommendRequestQueryDto;
      const subwayStationName = 'Station A';
      const fakeResults: PlaceEntity[] = [{ uuid: 'p1' } as PlaceEntity];
      const fakeQb = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(fakeResults),
      };
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(fakeQb as any);
      // When
      const result = await placeQueryRepository.findSubwayPlaceList(dto, subwayStationName);
      // Then
      expect(fakeQb.innerJoinAndSelect).toHaveBeenCalledWith('p.subways', 's');
      expect(fakeQb.andWhere).toHaveBeenCalledWith('s.name = :name', { name: subwayStationName });
      expect(fakeQb.andWhere).toHaveBeenCalledWith('s.place_type IN (:...types)', {
        types: ['음식점', '카페', '술집'],
      });
      expect(fakeQb.andWhere).toHaveBeenCalledWith('s.kakao_rating = :rating', { rating: 1 });
      expect(result).toEqual(fakeResults);
    });
  });

  describe('findSubwayCultureList', () => {
    it('should return subway culture list', async () => {
      // Given
      const dto = {
        line: 'Line 1',
        subway: 'Subway A',
        customs: [],
      } as ApiCoursePostRecommendRequestBodyDto;
      const fakeResults: PlaceEntity[] = [{ uuid: 'p1' } as PlaceEntity];
      const fakeQb = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(fakeResults),
      };
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(fakeQb as any);
      // When
      const result = await placeQueryRepository.findSubwayCultureList(dto);
      // Then
      expect(fakeQb.innerJoinAndSelect).toHaveBeenCalledWith('p.subways', 's');
      expect(fakeQb.where).toHaveBeenCalledWith('s.line = :line', { line: dto.line });
      expect(fakeQb.andWhere).toHaveBeenCalledWith('s.name = :name', { name: dto.subway });
      expect(fakeQb.andWhere).toHaveBeenCalledWith('s.place_type IN (:...types)', {
        types: ['전시', '팝업'],
      });
      expect(fakeQb.andWhere).toHaveBeenCalledWith('p.end_date > :now', { now: expect.any(Date) });
      expect(result).toEqual(fakeResults);
    });
  });

  describe('findSubwayPlacesCustomizeList', () => {
    it('should return customized subway places with theme filtering when applicable', async () => {
      // Given
      (PLACE_TYPE as any).FOOD = '음식점';
      const dto = {
        place_type: 'FOOD',
        theme_uuid: 'theme-uuid',
      } as ApiCourseGetPlaceCustomizeRequestQueryDto;
      const subwayStationName = 'Station A';
      const fakeResults: PlaceEntity[] = [{ uuid: 'p1' } as PlaceEntity];
      const fakeQb = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(fakeResults),
      };
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(fakeQb as any);
      // When
      const result = await placeQueryRepository.findSubwayPlacesCustomizeList(
        dto,
        subwayStationName,
      );
      // Then
      expect(fakeQb.innerJoinAndSelect).toHaveBeenCalledWith('p.subways', 's');
      expect(fakeQb.andWhere).toHaveBeenCalledWith('s.name = :name', { name: subwayStationName });
      expect(fakeQb.andWhere).toHaveBeenCalledWith('s.place_type = :type', { type: '음식점' });
      expect(fakeQb.andWhere).toHaveBeenCalledWith('s.kakao_rating = :rating', { rating: 1 });
      if (dto.theme_uuid && dto.place_type !== 'SHOPPING' && dto.place_type !== 'ENTERTAINMENT') {
        expect(fakeQb.innerJoinAndSelect).toHaveBeenCalledWith('p.placeThemes', 'pt');
        expect(fakeQb.andWhere).toHaveBeenCalledWith('pt.theme_uuid = :theme_uuid', {
          theme_uuid: dto.theme_uuid,
        });
      }
      expect(result).toEqual(fakeResults);
    });
  });

  describe('findSubwayPlacesCustomizeCultureList', () => {
    it('should return customized subway culture places', async () => {
      // Given
      const subwayStationName = 'Station A';
      const fakeResults: PlaceEntity[] = [{ uuid: 'p1' } as PlaceEntity];
      const fakeQb = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(fakeResults),
      };
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(fakeQb as any);
      // When
      const result = await placeQueryRepository.findSubwayPlacesCustomizeCultureList(
        subwayStationName,
      );
      // Then
      expect(fakeQb.innerJoinAndSelect).toHaveBeenCalledWith('p.subways', 's');
      expect(fakeQb.where).toHaveBeenCalledWith('s.name = :name', { name: subwayStationName });
      const bracketsCall = fakeQb.andWhere.mock.calls.find((call) => call[0] instanceof Brackets);
      expect(bracketsCall).toBeDefined();
      const bracketsInstance: Brackets = bracketsCall[0];
      const fakeInnerQb = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        whereInIds: jest.fn().mockReturnThis(),
        andWhereInIds: jest.fn().mockReturnThis(),
        orWhereInIds: jest.fn().mockReturnThis(),
      };
      bracketsInstance.whereFactory(fakeInnerQb);
      expect(fakeInnerQb.where).toHaveBeenCalledWith('s.place_type = :type1', { type1: '전시' });
      expect(fakeInnerQb.orWhere).toHaveBeenCalledWith('s.place_type = :type2', { type2: '팝업' });
      expect(fakeQb.andWhere).toHaveBeenCalledWith('p.end_date > :now', { now: expect.any(Date) });
      expect(fakeQb.andWhere).toHaveBeenCalledWith('s.kakao_rating >= :rating', { rating: 1 });
      expect(result).toEqual(fakeResults);
    });
  });

  describe('findPlacesWithUuids', () => {
    it('should return places matching given uuids', async () => {
      // Given
      const uuids = ['p1', 'p2'];
      const fakeResults: PlaceEntity[] = [
        { uuid: 'p1' } as PlaceEntity,
        { uuid: 'p2' } as PlaceEntity,
      ];
      repository.find.mockResolvedValue(fakeResults);
      // When
      const result = await placeQueryRepository.findPlacesWithUuids(uuids);
      // Then
      expect(repository.find).toHaveBeenCalledWith({ where: { uuid: In(uuids) } });
      expect(result).toEqual(fakeResults);
    });
  });
});
