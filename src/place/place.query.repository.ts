import { InjectRepository } from '@nestjs/typeorm';
import { PlaceEntity } from 'src/entities/place.entity';
import { Repository } from 'typeorm';
import { PlaceReadDto } from './dto/place.dto';

export class PlaceQueryRepository {
  constructor(
    @InjectRepository(PlaceEntity)
    private repository: Repository<PlaceEntity>,
  ) {}

  async findList(dto: PlaceReadDto): Promise<PlaceEntity[]> {
    const q = await this.repository.createQueryBuilder('place').select('place').where('1=1');
    if (dto.last_id > 0) q.andWhere('place.id < :last_id', { last_id: dto.last_id });
    q.orderBy('place.id', 'DESC');
    q.limit(dto.size);
    return q.getMany();
  }
}
