import { InjectRepository } from '@nestjs/typeorm';
import { now } from 'mongoose';
import { SearchLogEntity } from 'src/entities/search_log.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';

export class SearchQueryLogRepository {
  constructor(
    @InjectRepository(SearchLogEntity)
    private repository: Repository<SearchLogEntity>,
  ) {}

  async findLog(search, user): Promise<SearchLogEntity[]> {
    return await this.repository.find({
      where: {
        search: search,
        user_uuid: user.uuid,
      },
    });
  }

  async insert(search, uuid, user) {
    return await this.repository.insert({
      uuid: uuid,
      search: search,
      user_uuid: user.uuid,
    });
  }

  async update(id) {
    return await this.repository.update({ id: id }, { updated_at: new Date() });
  }

  async find(user): Promise<SearchLogEntity[]> {
    return await this.repository.find({
      where: {
        user_uuid: user.uuid,
      },
      order: { updated_at: 'DESC' },
      take: 10,
    });
  }
}
