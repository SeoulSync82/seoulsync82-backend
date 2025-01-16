import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Repository } from 'typeorm';
import { CommentEntity } from '../entities/comment.entity';
import { ApiCommentGetRequestQueryDto } from './dto/api-comment-get-request-query.dto';

export class CommentQueryRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private repository: Repository<CommentEntity>,
  ) {}

  async save(CommentEntity): Promise<CommentEntity> {
    return await this.repository.save(CommentEntity);
  }

  async findOne(uuid): Promise<CommentEntity> {
    return await this.repository.findOne({
      where: { uuid: uuid, archived_at: IsNull() },
    });
  }

  async find(uuid, dto: ApiCommentGetRequestQueryDto): Promise<CommentEntity[]> {
    const whereConditions = { target_uuid: uuid, archived_at: IsNull() };

    if (dto.last_id > 0) {
      Object.assign(whereConditions, { id: LessThan(dto.last_id) });
    }

    return await this.repository.find({
      where: whereConditions,
      order: { created_at: 'DESC' },
      take: dto.size,
    });
  }
}
