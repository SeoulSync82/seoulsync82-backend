import { InjectRepository } from '@nestjs/typeorm';
import { ApiBookmarkGetRequestQueryDto } from 'src/bookmark/dto/api-bookmark-get-request-query.dto';
import { BookmarkEntity } from 'src/entities/bookmark.entity';
import { In, IsNull, LessThan, Repository } from 'typeorm';

export class BookmarkQueryRepository {
  constructor(
    @InjectRepository(BookmarkEntity)
    private repository: Repository<BookmarkEntity>,
  ) {}

  async find(dto: ApiBookmarkGetRequestQueryDto, user): Promise<BookmarkEntity[]> {
    const whereConditions = { user_uuid: user.uuid, archived_at: IsNull() };

    if (dto.last_id > 0) {
      Object.assign(whereConditions, { id: LessThan(dto.last_id) });
    }

    return this.repository.find({
      where: whereConditions,
      relations: { course: true },
      order: { updated_at: 'DESC' },
      take: dto.size,
    });
  }

  async findOne(uuid): Promise<BookmarkEntity> {
    return this.repository.findOne({
      where: { uuid, archived_at: IsNull() },
    });
  }

  async findList(uuids): Promise<BookmarkEntity[]> {
    return this.repository.find({
      where: { uuid: In(uuids) },
    });
  }

  async findMyCourse(uuid): Promise<BookmarkEntity[]> {
    return this.repository.find({
      where: { course_uuid: uuid, archived_at: IsNull() },
    });
  }

  async bookmarkSave(bookmarkEntity: BookmarkEntity) {
    return this.repository.save(bookmarkEntity);
  }

  async bookmarkDelete(bookmarkEntity: BookmarkEntity) {
    return this.repository.update({ id: bookmarkEntity.id }, { archived_at: new Date() });
  }

  async bookmarkUpdate(bookmarkEntity: BookmarkEntity) {
    return this.repository.update({ id: bookmarkEntity.id }, { archived_at: null });
  }

  async findUserBookmark(user, uuid): Promise<BookmarkEntity> {
    return this.repository.findOne({
      where: { user_uuid: user.uuid, course_uuid: uuid, archived_at: IsNull() },
    });
  }
}
