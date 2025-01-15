import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from '../entities/comment.entity';

export class CommentQueryRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private repository: Repository<CommentEntity>,
  ) {}

  async save(CommentEntity): Promise<CommentEntity> {
    return await this.repository.save(CommentEntity);
  }
}
