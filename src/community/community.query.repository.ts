import { InjectRepository } from '@nestjs/typeorm';
import { CommunityEntity } from 'src/entities/community.entity';
import { IsNull, LessThan, Repository } from 'typeorm';

export class CommunityQueryRepository {
  constructor(
    @InjectRepository(CommunityEntity)
    private repository: Repository<CommunityEntity>,
  ) {}

  async save(communityEntity) {
    return await this.repository.save(communityEntity);
  }
