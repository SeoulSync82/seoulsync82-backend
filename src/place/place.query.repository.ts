import { InjectRepository } from '@nestjs/typeorm';
import { PLACE_TYPE } from 'src/commons/enum/place-type-enum';
import { CursorPaginationHelper } from 'src/commons/helpers/cursor.helper';
import { ApiCourseGetPlaceCustomizeRequestQueryDto } from 'src/course/dto/api-course-get-place-customize-request-query.dto';
import { ApiCourseGetRecommendRequestQueryDto } from 'src/course/dto/api-course-get-recommend-request-query.dto';
import { ApiCoursePostRecommendRequestBodyDto } from 'src/course/dto/api-course-post-recommend-request-body.dto';
import { PlaceEntity } from 'src/entities/place.entity';
import { SubwayEntity } from 'src/entities/subway.entity';
import { ApiPlaceGetCultureRequestQueryDto } from 'src/place/dto/api-place-get-culture-request-query.dto';
import { ApiPlaceGetExhibitionRequestQueryDto } from 'src/place/dto/api-place-get-exhibition-request-query.dto';
import { ApiPlaceGetPopupRequestQueryDto } from 'src/place/dto/api-place-get-popup-request-query.dto';
import { ApiSearchGetRequestQueryDto } from 'src/search/dto/api-search-get-request-query.dto';
import { Brackets, In, LessThan, Like, MoreThan, Repository } from 'typeorm';

export class PlaceQueryRepository {
  constructor(
    @InjectRepository(PlaceEntity)
    private repository: Repository<PlaceEntity>,
    @InjectRepository(SubwayEntity)
    private subwayRepository: Repository<SubwayEntity>,
  ) {}

  async findList(dto: ApiPlaceGetCultureRequestQueryDto): Promise<PlaceEntity[]> {
    const now = new Date();

    const q = await this.repository
      .createQueryBuilder('place')
      .select('place')
      .where('place.place_type IN (:...types)', { types: ['전시', '팝업'] })
      .andWhere('place.end_date > :now', { now });
    q.orderBy('start_date', 'DESC');
    q.limit(dto.size);
    return q.getMany();
  }

  async findOne(uuid): Promise<PlaceEntity> {
    return this.repository.findOne({
      where: { uuid },
    });
  }

  async findExhibitionList(dto: ApiPlaceGetExhibitionRequestQueryDto) {
    const qb = this.repository
      .createQueryBuilder('place')
      .where('place.place_type = :type', { type: '전시' })
      .andWhere('place.end_date > NOW()');

    CursorPaginationHelper.applyCursor(qb, dto.order, dto.next_page);

    if (dto.order === 'latest') {
      qb.orderBy('place.start_date', 'DESC').addOrderBy('place.id', 'DESC');
    } else {
      qb.orderBy('place.end_date', 'ASC').addOrderBy('place.id', 'ASC');
    }

    qb.take(dto.size + 1);
    const results = await qb.getMany();
    const hasNext = results.length > dto.size;

    return {
      items: hasNext ? results.slice(0, -1) : results,
      nextCursor: hasNext
        ? CursorPaginationHelper.generateCursor(results[dto.size - 1], dto.order)
        : null,
    };
  }

  async findPopupList(dto: ApiPlaceGetPopupRequestQueryDto) {
    const qb = this.repository
      .createQueryBuilder('place')
      .where('place.place_type = :type', { type: '팝업' })
      .andWhere('place.end_date > NOW()');

    CursorPaginationHelper.applyCursor(qb, dto.order, dto.next_page);

    if (dto.order === 'latest') {
      qb.orderBy('place.start_date', 'DESC').addOrderBy('place.id', 'DESC');
    } else {
      qb.orderBy('place.end_date', 'ASC').addOrderBy('place.id', 'ASC');
    }

    qb.take(dto.size + 1);
    const results = await qb.getMany();
    const hasNext = results.length > dto.size;

    return {
      items: hasNext ? results.slice(0, -1) : results,
      nextCursor: hasNext
        ? CursorPaginationHelper.generateCursor(results[dto.size - 1], dto.order)
        : null,
    };
  }

  async countPopup(): Promise<number> {
    const now = new Date();
    const whereConditions = {
      place_type: '팝업',
      end_date: MoreThan(now),
    };

    return this.repository.count({ where: whereConditions });
  }

  async countExhibition(): Promise<number> {
    return this.repository.count({
      where: { place_type: '전시', end_date: MoreThan(new Date()) },
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

    return this.repository.find({
      where: whereConditions,
      order: orderType,
      take: dto.size,
    });
  }

  async old_findSubwayPlaceList(
    customs,
    dto: ApiCoursePostRecommendRequestBodyDto,
  ): Promise<PlaceEntity[]> {
    return this.repository
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.subways', 's')
      .where('s.line = :line', { line: dto.line })
      .andWhere('s.name = :name', { name: dto.subway })
      .andWhere('s.place_type IN (:...types)', { types: customs })
      .andWhere('s.kakao_rating = :rating', { rating: 1 })
      .getMany();
  }

  async findSubwayPlaceList(
    dto: ApiCourseGetRecommendRequestQueryDto,
    subwayStationName: string,
  ): Promise<PlaceEntity[]> {
    const qb = this.repository
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.subways', 's')
      .andWhere('s.name = :name', { name: subwayStationName })
      .andWhere('s.place_type IN (:...types)', { types: ['음식점', '카페', '술집'] })
      .andWhere('s.kakao_rating = :rating', { rating: 1 });

    if (dto.theme_uuid) {
      qb.innerJoinAndSelect('p.placeThemes', 'pt').andWhere('pt.theme_uuid = :theme_uuid', {
        theme_uuid: dto.theme_uuid,
      });
    }

    return qb.getMany();
  }

  async findSubwayCultureList(dto: ApiCoursePostRecommendRequestBodyDto): Promise<PlaceEntity[]> {
    return this.repository
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.subways', 's')
      .where('s.line = :line', { line: dto.line })
      .andWhere('s.name = :name', { name: dto.subway })
      .andWhere('s.place_type IN (:...types)', { types: ['전시', '팝업'] })
      .andWhere('p.end_date > :now', { now: new Date() })
      .getMany();
  }

  async findSubwayPlaceCustomizeList(
    dto: ApiCourseGetPlaceCustomizeRequestQueryDto,
    subwayStationName: string,
  ): Promise<PlaceEntity[]> {
    return this.repository
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.subways', 's')
      .andWhere('s.name = :name', { name: subwayStationName })
      .andWhere('s.place_type = :type', { type: PLACE_TYPE[dto.place_type] })
      .andWhere('s.kakao_rating = :rating', { rating: 1 })
      .getMany();
  }

  async findSubwayPlaceCustomizeCultureList(subwayStationName: string): Promise<PlaceEntity[]> {
    const now = new Date();

    return this.repository
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.subways', 's')
      .where('s.name = :name', { name: subwayStationName })
      .andWhere(
        new Brackets((qb) => {
          qb.where('s.place_type = :type1', { type1: '전시' }).orWhere('s.place_type = :type2', {
            type2: '팝업',
          });
        }),
      )
      .andWhere('p.end_date > :now', { now })
      .andWhere('s.kakao_rating >= :rating', { rating: 1 })
      .getMany();
  }

  async findPlacesWithUuids(uuids: string[]): Promise<PlaceEntity[]> {
    return this.repository.find({
      where: { uuid: In(uuids) },
    });
  }
}
