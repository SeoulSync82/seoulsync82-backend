import { InjectRepository } from '@nestjs/typeorm';
import { assertCompositeType } from 'graphql';
import { ApiSubwayCheckGetRequestQueryDto } from 'src/subway/dto/api-subway-check-get-request-query.dto';
import { ApiCourseSubwayListGetRequestQueryDto } from 'src/subway/dto/api-subway-list-get-request-query.dto';
import { CourseRecommendReqDto } from 'src/course/dto/course.dto';
import { SubwayEntity } from 'src/entities/subway.entity';
import { SubwayStationEntity } from 'src/entities/subway_station.entity';
import { Repository, In, Not } from 'typeorm';
import { SubwayLineEntity } from 'src/entities/subway_line.entity';

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

  async groupByCustoms(dto: ApiSubwayCheckGetRequestQueryDto) {
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

  async findSubwayCurrentCulture(dto: ApiSubwayCheckGetRequestQueryDto) {
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

  async subwayStationList(dto: ApiCourseSubwayListGetRequestQueryDto) {
    return await this.subwayStationRepository.find({
      where: { line_uuid: dto.line_uuid },
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
