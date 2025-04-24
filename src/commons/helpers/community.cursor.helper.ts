/* eslint-disable camelcase */
import { CommunityEntity } from 'src/entities/community.entity';
import { ReactionEntity } from 'src/entities/reaction.entity';
import { SelectQueryBuilder } from 'typeorm';

export type CommunityCursorData = {
  created_at?: string;
  id?: number;
  like?: number;
};

export class CommunityCursorPaginationHelper {
  /** 좋아요 개수 계산 서브쿼리 */
  static buildLikeCountSub(qb: SelectQueryBuilder<any>): string {
    return qb
      .subQuery()
      .select('COUNT(r.id)')
      .from(ReactionEntity, 'r')
      .where('r.like = true')
      .andWhere('r.target_uuid = community.uuid')
      .getQuery();
  }

  /** 내가 좋아요 눌렀는지 계산 서브쿼리 */
  static buildIsLikedSub(qb: SelectQueryBuilder<any>): string {
    return qb
      .subQuery()
      .select('COUNT(r2.id)')
      .from(ReactionEntity, 'r2')
      .where('r2.user_uuid = :userUuid')
      .andWhere('r2.target_uuid = community.uuid')
      .getQuery();
  }

  /** 커서 페이징 로직 */
  static applyCursor(
    qb: SelectQueryBuilder<any>,
    orderType: 'latest' | 'popular',
    cursor: CommunityCursorData,
    likeCountSub: string,
  ) {
    const { created_at, id, like = 0 } = cursor;

    if (orderType === 'latest') {
      qb.andWhere(
        `(community.created_at < :created_at OR (community.created_at = :created_at AND community.id < :id))`,
        { created_at, id },
      );
    } else {
      qb.andWhere(
        `(
          ${likeCountSub} < :like
          OR (${likeCountSub}) = :like AND community.created_at < :created_at
          OR (${likeCountSub}) = :like AND community.created_at = :created_at AND community.id < :id
        )`,
        { like, created_at, id },
      );
    }
  }

  /** nextCursor 생성 */
  static generateCursor(last: CommunityEntity, orderType: 'latest' | 'popular'): string | null {
    if (!last?.created_at) return null;
    const data: CommunityCursorData =
      orderType === 'latest'
        ? { created_at: last.created_at.toISOString(), id: last.id }
        : {
            like: (last as any).like_count ?? 0,
            created_at: last.created_at.toISOString(),
            id: last.id,
          };
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }
}
