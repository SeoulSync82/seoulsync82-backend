import { InjectRepository } from '@nestjs/typeorm';
import { now } from 'mongoose';
import { PlaceEntity } from 'src/entities/place.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';
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

    if (dto.last_id > 0) {
      Object.assign(whereConditions, { id: LessThan(dto.last_id) });
    }

    return await this.repository.find({
      where: whereConditions,
      order: { id: 'DESC' },
      take: dto.size,
    });
  }

  async findPopupList(dto: PlaceReadDto): Promise<PlaceEntity[]> {
    const now = new Date();
    const whereConditions = { place_type: '팝업', end_date: MoreThan(now) };

    if (dto.last_id > 0) {
      Object.assign(whereConditions, { id: LessThan(dto.last_id) });
    }

    return await this.repository.find({
      where: whereConditions,
      order: { id: 'DESC' },
      take: dto.size,
    });
  }
}
