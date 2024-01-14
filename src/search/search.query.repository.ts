import { InjectRepository } from '@nestjs/typeorm';
import { PlaceEntity } from 'src/entities/place.entity';
import { Repository } from 'typeorm';

export class SearchQueryRepository {
  constructor(
    @InjectRepository(PlaceEntity)
    private repository: Repository<PlaceEntity>,
  ) {}
}
