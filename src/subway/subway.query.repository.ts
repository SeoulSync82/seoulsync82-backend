import { InjectRepository } from '@nestjs/typeorm';
import { SubwayEntity } from 'src/entities/subway.entity';
import { SubwayLineEntity } from 'src/entities/subway_line.entity';
import { SubwayStationEntity } from 'src/entities/subway_station.entity';
import { StationInfo } from 'src/subway/interfaces/subway.interfaces';
import { Repository } from 'typeorm';

export class SubwayQueryRepository {
  constructor(
    @InjectRepository(SubwayEntity)
    private repository: Repository<SubwayEntity>,
    @InjectRepository(SubwayStationEntity)
    private subwayStationRepository: Repository<SubwayStationEntity>,
    @InjectRepository(SubwayLineEntity)
    private subwayLineRepository: Repository<SubwayLineEntity>,
  ) {}

  async groupByCustoms(stationInfo: StationInfo) {
    return this.repository
      .createQueryBuilder('subway')
      .select('subway.place_type', 'type')
      .addSelect('COUNT(subway.id)', 'count')
      .where('subway.name = :name AND subway.line = :line', {
        name: stationInfo.station,
        line: stationInfo.line,
      })
      .groupBy('subway.place_type')
      .getRawMany();
  }

  async findSubwayCurrentCulture(stationInfo: StationInfo) {
    const now = new Date();

    return this.repository
      .createQueryBuilder('subway')
      .leftJoinAndSelect('place', 'p', 'p.uuid = subway.place_uuid')
      .select('subway.place_type', 'type')
      .addSelect('COUNT(subway.id)', 'count')
      .where('subway.name = :name AND subway.line = :line', {
        name: stationInfo.station,
        line: stationInfo.line,
      })
      .andWhere('subway.place_type IN (:...types)', {
        types: ['팝업', '전시'],
      })
      .andWhere('p.end_date > :now', { now })
      .groupBy('subway.place_type')
      .getRawMany();
  }

  async subwayStationList(lineUuid: string): Promise<SubwayStationEntity[]> {
    return this.subwayStationRepository.find({
      where: { line_uuid: lineUuid },
      order: { id: 'ASC' },
    });
  }

  async findSubwayLine(): Promise<SubwayLineEntity[]> {
    return this.subwayLineRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findSubway(subway: string): Promise<SubwayStationEntity[]> {
    return this.subwayStationRepository.find({
      where: { name: subway },
    });
  }

  async findLineAndStation(
    lineUuid: string,
    stationUuid: string,
  ): Promise<{
    line: string;
    station: string;
  }> {
    const result = await this.subwayStationRepository.findOne({
      where: { uuid: stationUuid, line_uuid: lineUuid },
    });

    return { line: result.line, station: result.name };
  }

  async findSubwayStationUuid(subwayUuid: string): Promise<SubwayStationEntity> {
    return this.subwayStationRepository.findOne({
      where: { uuid: subwayUuid },
    });
  }

  async findSubwayStationName(subwayName: string): Promise<SubwayStationEntity> {
    return this.subwayStationRepository.findOne({
      where: { name: subwayName },
    });
  }

  async findAllLinesForStation(subwayUuid: string): Promise<SubwayStationEntity[]> {
    return this.subwayStationRepository
      .createQueryBuilder('subway')
      .where('subway.uuid = :subwayUuid', { subwayUuid })
      .orWhere('subway.name = (SELECT name FROM subway_station WHERE uuid = :subwayUuid)', {
        subwayUuid,
      })
      .getMany();
  }
}
