import { InjectRepository } from '@nestjs/typeorm';
import { PLACE_TYPE } from 'src/commons/enum/place-type-enum';
import { CursorPaginationHelper } from 'src/commons/helpers/cursor.helper';
import { ApiCourseGetPlaceCustomizeRequestQueryDto } from 'src/course/dto/api-course-get-place-customize-request-query.dto';
import { ApiCourseGetRecommendRequestQueryDto } from 'src/course/dto/api-course-get-recommend-request-query.dto';
import { ApiCoursePostRecommendRequestBodyDto } from 'src/course/dto/api-course-post-recommend-request-body.dto';
import { PlaceEntity } from 'src/entities/place.entity';
import { ApiPlaceGetCultureRequestQueryDto } from 'src/place/dto/api-place-get-culture-request-query.dto';
import { ApiPlaceGetExhibitionRequestQueryDto } from 'src/place/dto/api-place-get-exhibition-request-query.dto';
import { ApiPlaceGetPopupRequestQueryDto } from 'src/place/dto/api-place-get-popup-request-query.dto';
import { ApiSearchGetRequestQueryDto } from 'src/search/dto/api-search-get-request-query.dto';
import { Brackets, FindOptionsOrder, In, LessThan, Like, MoreThan, Repository } from 'typeorm';

export class PlaceQueryRepository {
  constructor(
    @InjectRepository(PlaceEntity)
    private repository: Repository<PlaceEntity>,
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

  async findOne(uuid: string): Promise<PlaceEntity> {
    return this.repository.findOne({
      where: { uuid },
    });
  }

  async findExhibitionList(dto: ApiPlaceGetExhibitionRequestQueryDto) {
    const qb = this.repository
      .createQueryBuilder('place')
      .where('place.place_type = :type', { type: '전시' })
      .andWhere('place.end_date > NOW()');

    // 커서 적용
    if (dto.next_page) {
      CursorPaginationHelper.applyCursor(qb, dto.order, dto.next_page);
    }

    // 정렬 & 페이징
    if (dto.order === 'latest') {
      qb.orderBy('place.start_date', 'DESC').addOrderBy('place.id', 'DESC');
    } else {
      qb.orderBy('place.end_date', 'ASC').addOrderBy('place.id', 'ASC');
    }
    qb.take(dto.size + 1);

    const results = await qb.getMany();
    const hasNext = results.length > dto.size;
    const pageItems = hasNext ? results.slice(0, dto.size) : results;
    const nextCursor = hasNext
      ? CursorPaginationHelper.generateCursor(pageItems[pageItems.length - 1], dto.order)
      : null;

    return { items: pageItems, nextCursor };
  }

  async findPopupList(dto: ApiPlaceGetPopupRequestQueryDto) {
    const qb = this.repository
      .createQueryBuilder('place')
      .where('place.place_type = :type', { type: '팝업' })
      .andWhere('place.end_date > NOW()');

    // 커서 적용
    if (dto.next_page) {
      CursorPaginationHelper.applyCursor(qb, dto.order, dto.next_page);
    }

    // 정렬 & 페이징
    if (dto.order === 'latest') {
      qb.orderBy('place.start_date', 'DESC').addOrderBy('place.id', 'DESC');
    } else {
      qb.orderBy('place.end_date', 'ASC').addOrderBy('place.id', 'ASC');
    }
    qb.take(dto.size + 1);

    const results = await qb.getMany();
    const hasNext = results.length > dto.size;
    const pageItems = hasNext ? results.slice(0, dto.size) : results;
    const nextCursor = hasNext
      ? CursorPaginationHelper.generateCursor(pageItems[pageItems.length - 1], dto.order)
      : null;

    return { items: pageItems, nextCursor };
  }

  async countPopup(): Promise<number> {
    return this.repository.count({
      where: { place_type: '팝업', end_date: MoreThan(new Date()) },
    });
  }

  async countExhibition(): Promise<number> {
    return this.repository.count({
      where: { place_type: '전시', end_date: MoreThan(new Date()) },
    });
  }

  async getSearchPlace(dto: ApiSearchGetRequestQueryDto): Promise<PlaceEntity[]> {
    const { search, last_id: lastId, size, place_type: placeType } = dto;
    const where = {
      place_name: Like(`%${search}%`),
      ...(lastId > 0 ? { id: LessThan(lastId) } : {}),
      place_type: In(placeType === 'culture' ? ['전시회', '팝업'] : ['음식점', '카페', '술집']),
    };
    const order = (
      placeType === 'culture' ? { start_date: 'DESC' } : { review_count: 'DESC' }
    ) as FindOptionsOrder<PlaceEntity>;
    return this.repository.find({ where, order, take: size });
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

  async findSubwayPlacesCustomizeList(
    dto: ApiCourseGetPlaceCustomizeRequestQueryDto,
    subwayStationName: string,
  ): Promise<PlaceEntity[]> {
    const qb = this.repository
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.subways', 's')
      .andWhere('s.name = :name', { name: subwayStationName })
      .andWhere('s.place_type = :type', { type: PLACE_TYPE[dto.place_type] })
      .andWhere('s.kakao_rating = :rating', { rating: 1 });

    if (dto.theme_uuid && dto.place_type !== 'SHOPPING' && dto.place_type !== 'ENTERTAINMENT') {
      qb.innerJoinAndSelect('p.placeThemes', 'pt').andWhere('pt.theme_uuid = :theme_uuid', {
        theme_uuid: dto.theme_uuid,
      });
    }

    return qb.getMany();
  }

  async findSubwayPlacesCustomizeCultureList(subwayStationName: string): Promise<PlaceEntity[]> {
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
