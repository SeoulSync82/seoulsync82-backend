import { InjectRepository } from '@nestjs/typeorm';
import { distinct } from 'rxjs';
import { CourseRecommendReqDto } from 'src/course/dto/course.dto';
import { SubwayEntity } from 'src/entities/subway.entity';
import { Repository, In, Not } from 'typeorm';

export class SubwayQueryRepository {
  constructor(
    @InjectRepository(SubwayEntity)
    private repository: Repository<SubwayEntity>,
  ) {}

  async findsubwayPlaceList(customs, dto: CourseRecommendReqDto) {
    return await this.repository.find({
      where: { place_type: In(customs), kakao_rating: Not(0), name: dto.subway, line: dto.line },
    });
  }
}
