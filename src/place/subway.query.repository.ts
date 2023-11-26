import { InjectRepository } from '@nestjs/typeorm';
import { distinct } from 'rxjs';
import { CourseRecommendReqDto, SubwayCustomsCheckReqDto } from 'src/course/dto/course.dto';
import { SubwayEntity } from 'src/entities/subway.entity';
import { Repository, In, Not } from 'typeorm';

export class SubwayQueryRepository {
  constructor(
    @InjectRepository(SubwayEntity)
    private repository: Repository<SubwayEntity>,
  ) {}

  async findsubwayPlaceList(customs, dto: CourseRecommendReqDto): Promise<SubwayEntity[]> {
    return await this.repository.find({
      where: { place_type: In(customs), kakao_rating: Not(0), name: dto.subway, line: dto.line },
    });
  }

  async groupByCustom(dto: SubwayCustomsCheckReqDto) {
    return await this.repository
      .createQueryBuilder('subway')
      .select('subway.place_type')
      .where('subway.name = :name AND subway.line = :line', {
        name: dto.subway,
        line: dto.line,
      })
      .groupBy('subway.place_type')
      .getRawMany();
  }
}
