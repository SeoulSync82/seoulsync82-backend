import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { SearchLogEntity } from 'src/entities/search_log.entity';

export class SearchQueryLogRepository {
  constructor(
    @InjectRepository(SearchLogEntity)
    private repository: Repository<SearchLogEntity>,
  ) {}

  async findLog(search, user): Promise<SearchLogEntity[]> {
    return this.repository.find({
      where: {
        search,
        user_uuid: user.uuid,
        archived_at: IsNull(),
      },
    });
  }

  async insert(search, uuid, user) {
    return this.repository.insert({
      uuid,
      search,
      user_uuid: user.uuid,
    });
  }

  async update(id) {
    return this.repository.update({ id }, { updated_at: new Date() });
  }

  async find(user): Promise<SearchLogEntity[]> {
    return this.repository.find({
      where: {
        user_uuid: user.uuid,
        archived_at: IsNull(),
      },
      order: { updated_at: 'DESC' },
      take: 10,
    });
  }

  async findUserSearchLog(uuid, user): Promise<SearchLogEntity> {
    return this.repository.findOne({
      where: {
        uuid,
        user_uuid: user.uuid,
        archived_at: IsNull(),
      },
    });
  }

  async deleteSearchLog(searchLogEntity) {
    return this.repository.update({ id: searchLogEntity.id }, { archived_at: new Date() });
  }

  async findUserSearchLogList(user): Promise<SearchLogEntity[]> {
    return this.repository.find({
      where: {
        user_uuid: user.uuid,
        archived_at: IsNull(),
      },
    });
  }

  async save(searchLogEntity: SearchLogEntity[]): Promise<SearchLogEntity[]> {
    return this.repository.save(searchLogEntity);
  }
}
