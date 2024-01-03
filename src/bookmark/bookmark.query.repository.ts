import { InjectRepository } from '@nestjs/typeorm';
import { BookmarkEntity } from 'src/entities/bookmark.entity';
import { IsNull, LessThan, Repository, In } from 'typeorm';

export class BookmarkQueryRepository {
  constructor(
    @InjectRepository(BookmarkEntity)
    private repository: Repository<BookmarkEntity>,
  ) {}

  async find(dto, user): Promise<BookmarkEntity[]> {
    const whereConditions = { user_uuid: user.uuid, archived_at: IsNull() };

    if (dto.last_id > 0) {
      Object.assign(whereConditions, { id: LessThan(dto.last_id) });
    }

    return await this.repository.find({
      where: whereConditions,
      relations: { course: true },
      order: { created_at: 'DESC' },
      take: dto.size,
    });
  }

  async findOne(uuid): Promise<BookmarkEntity> {
    return await this.repository.findOne({
      where: { uuid: uuid, archived_at: IsNull() },
    });
  }

  async findList(uuids): Promise<BookmarkEntity[]> {
    return await this.repository.find({
      where: { uuid: In(uuids) },
    });
  }

  async findMyCourse(uuid): Promise<BookmarkEntity[]> {
    return await this.repository.find({
      where: { course_uuid: uuid },
    });
  }
}
