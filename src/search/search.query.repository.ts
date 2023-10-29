import { InjectRepository } from '@nestjs/typeorm';
import { now } from 'mongoose';
import { PlaceEntity } from 'src/entities/place.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';

export class SearchQueryRepository {
  constructor(
    @InjectRepository(PlaceEntity)
    private repository: Repository<PlaceEntity>,
  ) {}
}
