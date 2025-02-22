import { InjectRepository } from '@nestjs/typeorm';
import { CommunityEntity } from 'src/entities/community.entity';
import { IsNull, Repository } from 'typeorm';
import { CommunityCursorPaginationHelper } from '../commons/helpers/community.cursor.helper';
import { ApiCommunityGetRequestQueryDto } from './dto/api-community-get-request-query.dto';

export class CommunityQueryRepository {
  constructor(
    @InjectRepository(CommunityEntity)
    private repository: Repository<CommunityEntity>,
  ) {}

  async save(communityEntity) {
    return await this.repository.save(communityEntity);
  }

  async findOne(uuid): Promise<CommunityEntity> {
    return await this.repository.findOne({
      where: { uuid: uuid, archived_at: IsNull() },
    });
  }

  async myCommunity(user): Promise<CommunityEntity[]> {
    return await this.repository.find({
      where: { user_uuid: user.uuid, archived_at: IsNull() },
      order: { created_at: 'DESC' },
    });
  }

  async findCommunityByCourse(uuid, user): Promise<CommunityEntity> {
    return await this.repository.findOne({
      where: { course_uuid: uuid, user_uuid: user.uuid, archived_at: IsNull() },
    });
  }

  async countCommunity(): Promise<number> {
    return await this.repository.count({
      where: { archived_at: IsNull() },
    });
  }

  async findCommunityList(
    dto: ApiCommunityGetRequestQueryDto,
    user,
  ): Promise<{ communityList: CommunityEntity[]; nextCursor: string | null }> {
    const qb = this.repository
      .createQueryBuilder('community')
      .leftJoin('community.reactions', 'reaction', 'reaction.like = 1')
      .addSelect('COUNT(reaction.id)', 'like_count')
      .addSelect(`MAX(CASE WHEN reaction.user_uuid = :userUuid THEN 1 ELSE 0 END)`, 'isLiked')
      .setParameter('userUuid', user.uuid)
      .where('community.archived_at IS NULL')
      .groupBy('community.uuid')
      .addGroupBy('community.id')
      .addGroupBy('community.user_uuid')
      .addGroupBy('community.user_name')
      .addGroupBy('community.course_uuid')
      .addGroupBy('community.course_name')
      .addGroupBy('community.score')
      .addGroupBy('community.review')
      .addGroupBy('community.archived_at')
      .addGroupBy('community.created_at')
      .addGroupBy('community.updated_at');

    if (dto.me === true) {
      qb.andWhere('community.user_uuid = :userUuid', { userUuid: user.uuid });
    }

    const cursorData = dto.next_page
      ? CommunityCursorPaginationHelper.decodeCursor(dto.next_page)
      : undefined;
    CommunityCursorPaginationHelper.applyCursor(qb, dto.order, cursorData);

    if (dto.order === 'latest') {
      qb.orderBy('community.created_at', 'DESC').addOrderBy('community.id', 'DESC');
    } else {
      qb.orderBy('like_count', 'DESC')
        .addOrderBy('community.created_at', 'DESC')
        .addOrderBy('community.id', 'DESC');
    }

    qb.take(dto.size + 1);

    const { entities, raw } = await qb.getRawAndEntities();

    entities.forEach((community, idx) => {
      community.like_count = parseInt(raw[idx]['like_count'], 10);
      community.isLiked = parseInt(raw[idx]['isLiked'], 10) === 1;
    });

    const hasNext = entities.length > dto.size;
    const communityList = hasNext ? entities.slice(0, dto.size) : entities;
    const nextCursor = hasNext
      ? CommunityCursorPaginationHelper.generateCursor(
          communityList[communityList.length - 1],
          dto.order,
        )
      : null;

    return { communityList, nextCursor };
  }
}
