import { InjectRepository } from '@nestjs/typeorm';
import { CourseRecommendReqDto } from 'src/course/dto/course.dto';
import { SubwayEntity } from 'src/entities/subway.entity';
import { SubwayLineEntity } from 'src/entities/subway_line.entity';
import { SubwayStationEntity } from 'src/entities/subway_station.entity';
import { In, Not, Repository } from 'typeorm';
import { StationInfo } from './interfaces/subway.interfaces';

export class SubwayQueryRepository {
  constructor(
    @InjectRepository(SubwayEntity)
    private repository: Repository<SubwayEntity>,
    @InjectRepository(SubwayStationEntity)
    private subwayStationRepository: Repository<SubwayStationEntity>,
    @InjectRepository(SubwayLineEntity)
    private subwayLineRepository: Repository<SubwayLineEntity>,
  ) {}

  async findsubwayPlaceList(customs, dto: CourseRecommendReqDto): Promise<SubwayEntity[]> {
    return await this.repository.find({
      where: { place_type: In(customs), kakao_rating: Not(0), name: dto.subway, line: dto.line },
    });
  }

  async groupByCustoms(stationInfo: StationInfo) {
    return await this.repository
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

    return await this.repository
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

  async subwayStationList(line_uuid: string) {
    return await this.subwayStationRepository.find({
      where: { line_uuid: line_uuid },
      order: { id: 'ASC' },
    });
  }

  async findSubwayLine() {
    return await this.subwayLineRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findSubway(subway: string) {
    return await this.subwayStationRepository.find({
      where: { name: subway },
    });
  }

  async findLineAndStation(line_uuid: string, station_uuid: string) {
    const result = await this.subwayStationRepository.findOne({
      where: { uuid: station_uuid, line_uuid: line_uuid },
    });

    return { line: result.line, station: result.name };
  }
}
