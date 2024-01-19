import { InjectRepository } from '@nestjs/typeorm';
import { ApiCourseRecommendPostRequestBodyDto } from 'src/course/dto/api-course-recommend-post-request-body.dto';
import { PlaceEntity } from 'src/entities/place.entity';
import { SubwayEntity } from 'src/entities/subway.entity';
import { ApiSearchGetRequestQueryDto } from 'src/search/dto/api-search-get-request-query.dto';
import { LessThan, MoreThan, Repository, Like, In } from 'typeorm';
import { ApiPlaceCultureGetRequestQueryDto } from './dto/api-place-culture-get-request-query.dto';
import { ApiPlaceExhibitionGetRequestQueryDto } from './dto/api-place-exhibition-get-request-query.dto';
import { ApiPlacePopupGetRequestQueryDto } from './dto/api-place-popup-get-request-query.dto';

export class PlaceQueryRepository {
  constructor(
    @InjectRepository(PlaceEntity)
    private repository: Repository<PlaceEntity>,
    @InjectRepository(SubwayEntity)
    private subwayRepository: Repository<SubwayEntity>,
  ) {}

  async findList(dto: ApiPlaceCultureGetRequestQueryDto): Promise<PlaceEntity[]> {
    const now = new Date();

    const q = await this.repository
      .createQueryBuilder('place')
      .select('place')
      .where('place.place_type IN (:...types)', { types: ['전시', '팝업'] })
      .andWhere('place.end_date > :now', { now });
    if (dto.last_id > 0) q.andWhere('place.id < :last_id', { last_id: dto.last_id });
    q.orderBy('place.id', 'DESC');
    q.limit(dto.size);
    return q.getMany();
  }

  async findOne(uuid): Promise<PlaceEntity> {
    return await this.repository.findOne({
      where: { uuid: uuid },
    });
  }

  async findExhibitionList(dto: ApiPlaceExhibitionGetRequestQueryDto): Promise<PlaceEntity[]> {
    const now = new Date();
    const whereConditions = { place_type: '전시', end_date: MoreThan(now) };
    let orderType = {};

    if (dto.last_id > 0) {
      Object.assign(whereConditions, { id: LessThan(dto.last_id) });
    }

    if (dto.order === 'latest') {
      orderType = { start_date: 'DESC' };
    } else if (dto.order === 'deadline') {
      orderType = { end_date: 'ASC' };
    }

    return await this.repository.find({
      where: whereConditions,
      order: orderType,
      take: dto.size,
    });
  }

  async findPopupList(dto: ApiPlacePopupGetRequestQueryDto): Promise<PlaceEntity[]> {
    const now = new Date();
    const whereConditions = {
      place_type: '팝업',
      end_date: MoreThan(now),
    };
    let orderType = {};

    if (dto.last_id > 0) {
      Object.assign(whereConditions, { id: LessThan(dto.last_id) });
    }

    if (dto.order === 'latest') {
      orderType = { start_date: 'DESC' };
    } else if (dto.order === 'deadline') {
      orderType = { end_date: 'ASC' };
    }

    return await this.repository.find({
      where: whereConditions,
      order: orderType,
      take: dto.size,
    });
  }

  async search(dto: ApiSearchGetRequestQueryDto): Promise<PlaceEntity[]> {
    const whereConditions = {
      place_name: Like(`%${dto.search}%`),
    };
    let orderType = {};

    if (dto.last_id > 0) {
      Object.assign(whereConditions, { id: LessThan(dto.last_id) });
    }

    if (dto.place_type === 'restaurant' || null || '') {
      Object.assign(whereConditions, { place_type: In(['음식점', '카페', '술집']) });
      orderType = { review_count: 'DESC' };
    } else if (dto.place_type === 'culture') {
      Object.assign(whereConditions, { place_type: In(['전시회', '팝업']) });
      orderType = { start_date: 'DESC' };
    }

    return await this.repository.find({
      where: whereConditions,
      order: orderType,
      take: dto.size,
    });
  }

  async findSubwayPlaceList(
    customs,
    dto: ApiCourseRecommendPostRequestBodyDto,
  ): Promise<PlaceEntity[]> {
    return await this.repository
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.subways', 's')
      .where('s.line = :line', { line: dto.line })
      .andWhere('s.name = :name', { name: dto.subway })
      .andWhere('s.place_type IN (:...types)', { types: customs })
      .andWhere('s.kakao_rating = :rating', { rating: 1 })
      .getMany();
  }

  async findSubwayCultureList(dto: ApiCourseRecommendPostRequestBodyDto): Promise<PlaceEntity[]> {
    return await this.repository
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.subways', 's')
      .where('s.line = :line', { line: dto.line })
      .andWhere('s.name = :name', { name: dto.subway })
      .andWhere('s.place_type IN (:...types)', { types: ['전시', '팝업'] })
      .andWhere('p.end_date > :now', { now: new Date() })
      .getMany();
  }
}
