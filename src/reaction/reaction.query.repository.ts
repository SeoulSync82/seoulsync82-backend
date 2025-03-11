import { InjectRepository } from '@nestjs/typeorm';
import { ReactionEntity } from 'src/entities/reaction.entity';
import { UserDto } from 'src/user/dto/user.dto';
import { In, Repository } from 'typeorm';

export class ReactionQueryRepository {
  constructor(
    @InjectRepository(ReactionEntity)
    private repository: Repository<ReactionEntity>,
  ) {}

  async findOne(uuid: string, user: UserDto): Promise<ReactionEntity> {
    return this.repository.findOne({
      where: { target_uuid: uuid, user_uuid: user.uuid },
    });
  }

  async courseLike(reaction: ReactionEntity): Promise<ReactionEntity> {
    return this.repository.save(reaction);
  }

  async updateCourseLike(reaction: ReactionEntity) {
    return this.repository.update({ id: reaction.id }, { like: 1 });
  }

  async updateCourseLikeDelete(reaction: ReactionEntity) {
    return this.repository.update({ id: reaction.id }, { like: 0 });
  }

  async findCommunityReaction(uuids: string[]): Promise<ReactionEntity[]> {
    return this.repository.find({ where: { target_uuid: In(uuids), like: 1 } });
  }

  async findCommunityDetailReaction(uuid: string): Promise<ReactionEntity[]> {
    return this.repository.find({ where: { target_uuid: uuid, like: 1 } });
  }
}
