import { InjectRepository } from '@nestjs/typeorm';
import { assertCompositeType } from 'graphql';
import { ApiCourseSubwayCheckGetRequestQueryDto } from 'src/course/dto/api-course-subway-check-get-request-query.dto';
import { ApiCourseSubwayListGetRequestQueryDto } from 'src/course/dto/api-course-subway-list-get-request-query.dto';
import { CourseRecommendReqDto } from 'src/course/dto/course.dto';
import { SubwayEntity } from 'src/entities/subway.entity';
import { SubwayStationEntity } from 'src/entities/subway_station.entity';
import { Repository, In, Not } from 'typeorm';

export class SubwayQueryRepository {
  constructor(
    @InjectRepository(SubwayEntity)
    private repository: Repository<SubwayEntity>,
    @InjectRepository(SubwayStationEntity)
    private subwayStationRepository: Repository<SubwayStationEntity>,
  ) {}

  async findsubwayPlaceList(customs, dto: CourseRecommendReqDto): Promise<SubwayEntity[]> {
    return await this.repository.find({
      where: { place_type: In(customs), kakao_rating: Not(0), name: dto.subway, line: dto.line },
    });
  }

  async groupByCustoms(dto: ApiCourseSubwayCheckGetRequestQueryDto) {
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

  async subwayStationList(dto: ApiCourseSubwayListGetRequestQueryDto) {
    return await this.subwayStationRepository.find({
      where: { line: dto.line },
      order: { id: 'ASC' },
    });
  }
}
