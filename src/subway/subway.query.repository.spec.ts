import { TestBed } from '@automock/jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubwayEntity } from 'src/entities/subway.entity';
import { SubwayLineEntity } from 'src/entities/subway_line.entity';
import { SubwayStationEntity } from 'src/entities/subway_station.entity';
import { StationInfo } from 'src/subway/interfaces/subway.interfaces';
import { SubwayQueryRepository } from 'src/subway/subway.query.repository';
import { Repository } from 'typeorm';

describe('SubwayQueryRepository', () => {
  let repository: SubwayQueryRepository;
  let subwayEntityRepository: jest.Mocked<Repository<SubwayEntity>>;
  let subwayStationRepository: jest.Mocked<Repository<SubwayStationEntity>>;
  let subwayLineRepository: jest.Mocked<Repository<SubwayLineEntity>>;

  beforeEach(async () => {
    // Given
    const { unit, unitRef } = TestBed.create(SubwayQueryRepository).compile();
    repository = unit;
    subwayEntityRepository = unitRef.get(getRepositoryToken(SubwayEntity) as string);
    subwayStationRepository = unitRef.get(getRepositoryToken(SubwayStationEntity) as string);
    subwayLineRepository = unitRef.get(getRepositoryToken(SubwayLineEntity) as string);
    jest.clearAllMocks();
  });

  describe('groupByCustoms', () => {
    it('should return raw results from query builder', async () => {
      // Given
      const stationInfo: StationInfo = { station: 'Station A', line: 'Line 1' };
      const rawResult = [{ type: 'RESTAURANT', count: '10' }];
      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(rawResult),
      };
      jest.spyOn(subwayEntityRepository, 'createQueryBuilder').mockReturnValue(qb as any);
      // When
      const result = await repository.groupByCustoms(stationInfo);
      // Then
      expect(qb.select).toHaveBeenCalledWith('subway.place_type', 'type');
      expect(qb.addSelect).toHaveBeenCalledWith('COUNT(subway.id)', 'count');
      expect(qb.where).toHaveBeenCalledWith('subway.name = :name AND subway.line = :line', {
        name: stationInfo.station,
        line: stationInfo.line,
      });
      expect(qb.groupBy).toHaveBeenCalledWith('subway.place_type');
      expect(result).toEqual(rawResult);
    });
  });

  describe('findSubwayCurrentCulture', () => {
    it('should return raw results for current culture', async () => {
      // Given
      const stationInfo: StationInfo = { station: 'Station A', line: 'Line 1' };
      const rawResult = [{ type: '전시', count: '2' }];
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(rawResult),
      };
      jest.spyOn(subwayEntityRepository, 'createQueryBuilder').mockReturnValue(qb as any);
      // When
      const result = await repository.findSubwayCurrentCulture(stationInfo);
      // Then
      expect(qb.select).toHaveBeenCalledWith('subway.place_type', 'type');
      expect(qb.addSelect).toHaveBeenCalledWith('COUNT(subway.id)', 'count');
      expect(qb.where).toHaveBeenCalledWith('subway.name = :name AND subway.line = :line', {
        name: stationInfo.station,
        line: stationInfo.line,
      });
      expect(qb.andWhere).toHaveBeenCalledWith('subway.place_type IN (:...types)', {
        types: ['팝업', '전시'],
      });
      expect(qb.andWhere).toHaveBeenCalledWith('p.end_date > :now', { now: expect.any(Date) });
      expect(qb.groupBy).toHaveBeenCalledWith('subway.place_type');
      expect(result).toEqual(rawResult);
    });
  });

  describe('subwayStationList', () => {
    it('should return subway station list for a given lineUuid', async () => {
      // Given
      const lineUuid = 'line-uuid';
      const stationList: SubwayStationEntity[] = [
        {
          id: 1,
          uuid: 's1',
          name: 'Station A',
          line: 'Line 1',
          line_uuid: lineUuid,
        } as SubwayStationEntity,
        {
          id: 2,
          uuid: 's2',
          name: 'Station B',
          line: 'Line 1',
          line_uuid: lineUuid,
        } as SubwayStationEntity,
      ];
      jest.spyOn(subwayStationRepository, 'find').mockResolvedValue(stationList);
      // When
      const result = await repository.subwayStationList(lineUuid);
      // Then
      expect(subwayStationRepository.find).toHaveBeenCalledWith({
        where: { line_uuid: lineUuid },
        order: { id: 'ASC' },
      });
      expect(result).toEqual(stationList);
    });
  });

  describe('findSubwayLine', () => {
    it('should return subway line list', async () => {
      // Given
      const lineList: SubwayLineEntity[] = [
        { id: 1, uuid: 'l1', line: 'Line 1' } as SubwayLineEntity,
        { id: 2, uuid: 'l2', line: 'Line 2' } as SubwayLineEntity,
      ];
      jest.spyOn(subwayLineRepository, 'find').mockResolvedValue(lineList);
      // When
      const result = await repository.findSubwayLine();
      // Then
      expect(subwayLineRepository.find).toHaveBeenCalledWith({
        order: { id: 'ASC' },
      });
      expect(result).toEqual(lineList);
    });
  });

  describe('findSubway', () => {
    it('should return subway stations by name', async () => {
      // Given
      const subwayName = 'Station A';
      const stationList: SubwayStationEntity[] = [
        {
          id: 1,
          uuid: 's1',
          name: subwayName,
          line: 'Line 1',
          line_uuid: 'l1',
        } as SubwayStationEntity,
      ];
      jest.spyOn(subwayStationRepository, 'find').mockResolvedValue(stationList);
      // When
      const result = await repository.findSubway(subwayName);
      // Then
      expect(subwayStationRepository.find).toHaveBeenCalledWith({
        where: { name: subwayName },
      });
      expect(result).toEqual(stationList);
    });
  });

  describe('findLineAndStation', () => {
    it('should return line and station info for given uuids', async () => {
      // Given
      const lineUuid = 'l1';
      const stationUuid = 's1';
      const station: SubwayStationEntity = {
        id: 1,
        uuid: stationUuid,
        name: 'Station A',
        line: 'Line 1',
        line_uuid: lineUuid,
      } as SubwayStationEntity;
      jest.spyOn(subwayStationRepository, 'findOne').mockResolvedValue(station);
      // When
      const result = await repository.findLineAndStation(lineUuid, stationUuid);
      // Then
      expect(subwayStationRepository.findOne).toHaveBeenCalledWith({
        where: { uuid: stationUuid, line_uuid: lineUuid },
      });
      expect(result).toEqual({ line: station.line, station: station.name });
    });
  });

  describe('findSubwayStationUuid', () => {
    it('should return a subway station for a given uuid', async () => {
      // Given
      const subwayUuid = 's1';
      const station: SubwayStationEntity = {
        id: 1,
        uuid: subwayUuid,
        name: 'Station A',
        line: 'Line 1',
        line_uuid: 'l1',
      } as SubwayStationEntity;
      jest.spyOn(subwayStationRepository, 'findOne').mockResolvedValue(station);
      // When
      const result = await repository.findSubwayStationUuid(subwayUuid);
      // Then
      expect(subwayStationRepository.findOne).toHaveBeenCalledWith({
        where: { uuid: subwayUuid },
      });
      expect(result).toEqual(station);
    });
  });

  describe('findSubwayStationName', () => {
    it('should return a subway station for a given name', async () => {
      // Given
      const subwayName = 'Station A';
      const station: SubwayStationEntity = {
        id: 1,
        uuid: 's1',
        name: subwayName,
        line: 'Line 1',
        line_uuid: 'l1',
      } as SubwayStationEntity;
      jest.spyOn(subwayStationRepository, 'findOne').mockResolvedValue(station);
      // When
      const result = await repository.findSubwayStationName(subwayName);
      // Then
      expect(subwayStationRepository.findOne).toHaveBeenCalledWith({
        where: { name: subwayName },
      });
      expect(result).toEqual(station);
    });
  });

  describe('findAllLinesForStation', () => {
    it('should return all station entries matching given subwayUuid or name derived from it', async () => {
      // Given
      const subwayUuid = 's1';
      const stationEntries: SubwayStationEntity[] = [
        {
          id: 1,
          uuid: 's1',
          name: 'Station A',
          line: 'Line 1',
          line_uuid: 'l1',
        } as SubwayStationEntity,
        {
          id: 2,
          uuid: 's2',
          name: 'Station A',
          line: 'Line 1',
          line_uuid: 'l1',
        } as SubwayStationEntity,
      ];
      const qb = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(stationEntries),
      };
      jest.spyOn(subwayStationRepository, 'createQueryBuilder').mockReturnValue(qb as any);
      // When
      const result = await repository.findAllLinesForStation(subwayUuid);
      // Then
      expect(qb.where).toHaveBeenCalledWith('subway.uuid = :subwayUuid', { subwayUuid });
      expect(qb.orWhere).toHaveBeenCalledWith(
        'subway.name = (SELECT name FROM subway_station WHERE uuid = :subwayUuid)',
        { subwayUuid },
      );
      expect(qb.getMany).toHaveBeenCalled();
      expect(result).toEqual(stationEntries);
    });
  });
});
