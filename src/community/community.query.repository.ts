import { InjectRepository } from '@nestjs/typeorm';
import { CommunityCursorPaginationHelper } from 'src/commons/helpers/community.cursor.helper';
import { ApiCommunityGetRequestQueryDto } from 'src/community/dto/api-community-get-request-query.dto';
import { CommunityEntity } from 'src/entities/community.entity';
import { UserDto } from 'src/user/dto/user.dto';
import { IsNull, Repository } from 'typeorm';

export class CommunityQueryRepository {
  constructor(
    @InjectRepository(CommunityEntity)
    private repository: Repository<CommunityEntity>,
  ) {}

  async save(communityEntity: CommunityEntity): Promise<CommunityEntity> {
    return this.repository.save(communityEntity);
  }

  async findOne(uuid: string): Promise<CommunityEntity> {
    return this.repository.findOne({
      where: { uuid, archived_at: IsNull() },
    });
  }

  async myCommunity(user: UserDto): Promise<CommunityEntity[]> {
    return this.repository.find({
      where: { user_uuid: user.uuid, archived_at: IsNull() },
      order: { created_at: 'DESC' },
    });
  }

  async findCommunityByCourse(uuid: string, user: UserDto): Promise<CommunityEntity> {
    return this.repository.findOne({
      where: { course_uuid: uuid, user_uuid: user.uuid, archived_at: IsNull() },
    });
  }

  async countTotalCommunity(dto: ApiCommunityGetRequestQueryDto, user: UserDto): Promise<number> {
    const qb = this.repository
      .createQueryBuilder('community')
      .where('community.archived_at IS NULL');

    if (dto.me) {
      qb.andWhere('community.user_uuid = :userUuid', { userUuid: user.uuid });
    }

    return qb.getCount();
  }

  async findCommunityList(
    dto: ApiCommunityGetRequestQueryDto,
    user: UserDto,
  ): Promise<{ communityList: CommunityEntity[]; nextCursor: string | null }> {
    const qb = this.repository.createQueryBuilder('community');

    // 1. 서브쿼리 생성
    const likeCountSub = CommunityCursorPaginationHelper.buildLikeCountSub(qb);
    const isLikedSub = CommunityCursorPaginationHelper.buildIsLikedSub(qb);

    // 2. SELECT에 서브쿼리 추가
    qb.addSelect(`${likeCountSub}`, 'like_count')
      .addSelect(`${isLikedSub}`, 'isLiked')
      .where('community.archived_at IS NULL')
      .setParameter('userUuid', user.uuid);

    if (dto.me) {
      qb.andWhere('community.user_uuid = :userUuid', { userUuid: user.uuid });
    }

    // 3. 커서 필터
    if (dto.next_page) {
      CommunityCursorPaginationHelper.applyCursor(qb, dto.order, dto.next_page, likeCountSub);
    }

    // 4. 정렬 및 페이징
    if (dto.order === 'latest') {
      qb.orderBy('community.created_at', 'DESC').addOrderBy('community.id', 'DESC');
    } else {
      qb.orderBy('like_count', 'DESC')
        .addOrderBy('community.created_at', 'DESC')
        .addOrderBy('community.id', 'DESC');
    }
    qb.take(dto.size + 1);

    // 5. 실행 후 매핑
    const { entities, raw } = await qb.getRawAndEntities();
    const updated = entities.map((c, i) => ({
      ...c,
      like_count: parseInt(raw[i].like_count, 10),
      isLiked: raw[i].isLiked === '1',
    }));

    // 6. nextCursor 계산
    const hasNext = updated.length > dto.size;
    const pageItems = hasNext ? updated.slice(0, dto.size) : updated;
    const nextCursor = hasNext
      ? CommunityCursorPaginationHelper.generateCursor(pageItems[pageItems.length - 1], dto.order)
      : null;

    return { communityList: pageItems, nextCursor };
  }

  async findExistingCourse(courseUuids: string[]) {
    const result = await this.repository
      .createQueryBuilder('community')
      .leftJoin('community.reactions', 'reaction', 'reaction.like = 1')
      .select('community.course_uuid', 'course_uuid')
      .addSelect('community.score', 'score')
      .addSelect('COUNT(reaction.id)', 'like_count')
      .where('community.course_uuid IN (:...courseUuids)', { courseUuids })
      .andWhere('community.archived_at IS NULL')
      .groupBy('community.course_uuid')
      .addGroupBy('community.score')
      .getRawMany();

    return result.map((row) => ({
      course_uuid: row.course_uuid,
      score: row.score,
      like_count: parseInt(row.like_count, 10),
    }));
  }
}
