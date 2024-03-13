import { InjectRepository } from '@nestjs/typeorm';
import { CourseRecommendReqDto } from 'src/course/dto/course.dto';
import { SubwayEntity } from 'src/entities/subway.entity';
import { SubwayLineEntity } from 'src/entities/subway_line.entity';
import { SubwayStationEntity } from 'src/entities/subway_station.entity';
import { ApiSubwayGetCheckRequestQueryDto } from 'src/subway/dto/api-subway-get-check-request-query.dto';
import { In, Not, Repository } from 'typeorm';

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

  async groupByCustoms(dto: ApiSubwayGetCheckRequestQueryDto) {
    return await this.repository
      .createQueryBuilder('subway')
      .select('subway.place_type', 'type')
      .addSelect('COUNT(subway.id)', 'count')
      .where('subway.name = :name AND subway.line = :line', {
        name: dto.subway,
        line: dto.line,
      })
      .groupBy('subway.place_type')
      .getRawMany();
  }

  async findSubwayCurrentCulture(dto: ApiSubwayGetCheckRequestQueryDto) {
    const now = new Date();

    return await this.repository
      .createQueryBuilder('subway')
      .leftJoinAndSelect('place', 'p', 'p.uuid = subway.place_uuid')
      .select('subway.place_type', 'type')
      .addSelect('COUNT(subway.id)', 'count')
      .where('subway.name = :name AND subway.line = :line', {
        name: dto.subway,
        line: dto.line,
      })
      .andWhere('subway.place_type IN (:...types)', {
        types: ['팝업', '전시'],
      })
      .andWhere('p.end_date > :now', { now })
      .groupBy('subway.place_type')
      .getRawMany();
  }

  async subwayStationList(uuid) {
    return await this.subwayStationRepository.find({
      where: { line_uuid: uuid },
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
}
