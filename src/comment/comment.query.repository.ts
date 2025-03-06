import { InjectRepository } from '@nestjs/typeorm';
import { ApiCommentGetRequestQueryDto } from 'src/comment/dto/api-comment-get-request-query.dto';
import { CommentEntity } from 'src/entities/comment.entity';
import { IsNull, LessThan, Repository } from 'typeorm';

export class CommentQueryRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private repository: Repository<CommentEntity>,
  ) {}

  async save(commentEntity: CommentEntity): Promise<CommentEntity> {
    return this.repository.save(commentEntity);
  }

  async findOne(uuid: string): Promise<CommentEntity> {
    return this.repository.findOne({
      where: { uuid, archived_at: IsNull() },
    });
  }

  async find(uuid: string, dto: ApiCommentGetRequestQueryDto): Promise<CommentEntity[]> {
    const whereConditions = {
      target_uuid: uuid,
      archived_at: IsNull(),
      ...(dto.last_id > 0 ? { id: LessThan(dto.last_id) } : {}),
    };

    return this.repository.find({
      where: whereConditions,
      order: { created_at: 'DESC' },
      take: dto.size,
    });
  }
}
