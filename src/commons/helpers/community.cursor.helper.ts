import { CommunityEntity } from 'src/entities/community.entity';
import { SelectQueryBuilder } from 'typeorm';

type CommunityCursorData = {
  created_at?: string;
  like?: number;
  id?: number;
};

export class CommunityCursorPaginationHelper {
  static applyCursor(
    qb: SelectQueryBuilder<any>,
    orderType: 'latest' | 'popular',
    cursorObj?: CommunityCursorData,
  ) {
    if (!cursorObj) return;

    if (orderType === 'latest') {
      qb.andWhere(
        `(community.created_at < :created_at OR (community.created_at = :created_at AND community.id < :id))`,
        {
          created_at: cursorObj.created_at,
          id: cursorObj.id,
        },
      );
    } else {
      qb.andHaving(
        `(like_count < :like OR (like_count = :like AND community.created_at < :created_at) OR (like_count = :like AND community.created_at = :created_at AND community.id < :id))`,
        {
          like: cursorObj.like ?? 0,
          created_at: cursorObj.created_at,
          id: cursorObj.id,
        },
      );
    }
  }

  static generateCursor(lastItem: CommunityEntity, orderType: 'latest' | 'popular'): string | null {
    if (!lastItem || !lastItem.created_at) {
      return null;
    }

    const cursorData =
      orderType === 'latest'
        ? { created_at: new Date(lastItem.created_at).toISOString(), id: lastItem.id }
        : {
            like: lastItem.like_count ?? 0,
            created_at: new Date(lastItem.created_at).toISOString(),
            id: lastItem.id,
          };

    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
  }

  static decodeCursor(cursor): CommunityCursorData | null {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }
}
