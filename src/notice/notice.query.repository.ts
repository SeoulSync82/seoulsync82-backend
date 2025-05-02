import { InjectRepository } from '@nestjs/typeorm';
import { NoticeEntity } from 'src/entities/notice.entity';
import { ApiNoticeGetRequestQueryDto } from 'src/notice/dto/api-notice-get-request-query.dto';
import { IsNull, LessThan, Repository } from 'typeorm';

export class NoticeQueryRepository {
  constructor(
    @InjectRepository(NoticeEntity)
    private repository: Repository<NoticeEntity>,
  ) {}

  async save(noticeEntity: NoticeEntity): Promise<NoticeEntity> {
    return this.repository.save(noticeEntity);
  }

  async findOne(uuid: string): Promise<NoticeEntity> {
    return this.repository.findOne({
      where: { uuid, archived_at: IsNull() },
    });
  }

  async find(dto: ApiNoticeGetRequestQueryDto): Promise<NoticeEntity[]> {
    const whereConditions = {
      archived_at: IsNull(),
      ...(dto.last_id > 0 ? { id: LessThan(dto.last_id) } : {}),
    };

    return this.repository.find({
      where: whereConditions,
      order: { published_at: 'DESC' },
      take: dto.size,
    });
  }
}
