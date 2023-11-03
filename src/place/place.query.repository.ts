import { InjectRepository } from '@nestjs/typeorm';
import { now } from 'mongoose';
import { PlaceEntity } from 'src/entities/place.entity';
import { SearchDto } from 'src/search/dto/search.dto';
import {
  LessThan,
  MoreThan,
  Repository,
  Like,
  In,
  FindOptionsWhere,
  FindOptionsOrder,
} from 'typeorm';
import { PlaceReadDto } from './dto/place.dto';

export class PlaceQueryRepository {
  constructor(
    @InjectRepository(PlaceEntity)
    private repository: Repository<PlaceEntity>,
  ) {}

  async findList(dto: PlaceReadDto): Promise<PlaceEntity[]> {
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

  async findExhibitionList(dto: PlaceReadDto): Promise<PlaceEntity[]> {
    const now = new Date();
    const whereConditions = { place_type: '전시', end_date: MoreThan(now) };
    let orderType = {};

    if (dto.last_id > 0) {
      Object.assign(whereConditions, { id: LessThan(dto.last_id) });
    }

    if (dto.order === 'lastest') {
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

  async findPopupList(dto: PlaceReadDto): Promise<PlaceEntity[]> {
    const now = new Date();
    const whereConditions: FindOptionsWhere<PlaceEntity> = {
      place_type: '팝업',
      end_date: MoreThan(now),
    };
    const orderType: FindOptionsOrder<PlaceEntity> = {};

    if (dto.last_id > 0) {
      whereConditions.id = LessThan(dto.last_id);
    }

    if (dto.order === 'lastest') {
      orderType.start_date = 'DESC';
    } else if (dto.order === 'deadline') {
      orderType.end_date = 'ASC';
    }

    return await this.repository.find({
      where: whereConditions,
      order: orderType,
      take: dto.size,
    });
  }

  async search(dto: SearchDto): Promise<PlaceEntity[]> {
    const whereConditions = {
      place_name: Like(`%${dto.place_name}%`),
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
}
