import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ReactionEntity } from 'src/entities/reaction.entity';

export class ReactionQueryRepository {
  constructor(
    @InjectRepository(ReactionEntity)
    private repository: Repository<ReactionEntity>,
  ) {}

  async findOne(uuid, user): Promise<ReactionEntity> {
    return this.repository.findOne({
      where: { target_uuid: uuid, user_uuid: user.uuid },
    });
  }

  async courseLike(reaction): Promise<ReactionEntity> {
    return this.repository.save(reaction);
  }

  async updateCourseLike(reaction) {
    return this.repository.update({ id: reaction.id }, { like: 1 });
  }

  async updateCourseLikeDelete(reaction) {
    return this.repository.update({ id: reaction.id }, { like: 0 });
  }

  async findCommunityReaction(uuids): Promise<ReactionEntity[]> {
    return this.repository.find({ where: { target_uuid: In(uuids), like: 1 } });
  }

  async findCommunityDetailReaction(uuid): Promise<ReactionEntity[]> {
    return this.repository.find({ where: { target_uuid: uuid, like: 1 } });
  }
}
