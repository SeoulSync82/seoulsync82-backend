import { InjectRepository } from '@nestjs/typeorm';
import { SearchLogEntity } from 'src/entities/search_log.entity';
import { UserDto } from 'src/user/dto/user.dto';
import { In, IsNull, Repository } from 'typeorm';

export class SearchQueryRepository {
  constructor(
    @InjectRepository(SearchLogEntity)
    private repository: Repository<SearchLogEntity>,
  ) {}

  async findUserSearchLog(search: string, user: UserDto): Promise<SearchLogEntity[]> {
    return this.repository.find({
      where: {
        search,
        user_uuid: user.uuid,
        archived_at: IsNull(),
      },
    });
  }

  async addLog(search: string, uuid: string, user: UserDto) {
    return this.repository.insert({
      uuid,
      search,
      user_uuid: user.uuid,
    });
  }

  async updateSearchDate(id: number) {
    return this.repository.update({ id }, { updated_at: new Date() });
  }

  async findRecentUserLog(user: UserDto): Promise<SearchLogEntity[]> {
    return this.repository.find({
      where: {
        user_uuid: user.uuid,
        archived_at: IsNull(),
      },
      order: { updated_at: 'DESC' },
      take: 10,
    });
  }

  async findUserLogToUuid(uuid: string, user: UserDto): Promise<SearchLogEntity> {
    return this.repository.findOne({
      where: {
        uuid,
        user_uuid: user.uuid,
        archived_at: IsNull(),
      },
    });
  }

  async deleteSearchLog(searchLogEntity: SearchLogEntity) {
    return this.repository.update({ id: searchLogEntity.id }, { archived_at: new Date() });
  }

  async findUserTotalSearchLog(user: UserDto): Promise<SearchLogEntity[]> {
    return this.repository.find({
      where: {
        user_uuid: user.uuid,
        archived_at: IsNull(),
      },
    });
  }

  async updateDateDelete(userTotalSearchLog: SearchLogEntity[]): Promise<void> {
    const ids = userTotalSearchLog.map((entity) => entity.id);

    await this.repository.update({ id: In(ids) }, { archived_at: new Date() });
  }
}
