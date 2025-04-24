import { PlaceEntity } from 'src/entities/place.entity';
import { SelectQueryBuilder } from 'typeorm';

type CursorData = {
  start_date?: string;
  end_date?: string;
  id?: number;
};

export class CursorPaginationHelper {
  /** 최신순 커서 조건 문자열 생성 */
  static buildLatestCondition(alias = 'place'): string {
    return `(${alias}.start_date < :date OR (${alias}.start_date = :date AND ${alias}.id < :id))`;
  }

  /** 마감순 커서 조건 문자열 생성 */
  static buildDeadlineCondition(alias = 'place'): string {
    return `(${alias}.end_date > :date OR (${alias}.end_date = :date AND ${alias}.id > :id))`;
  }

  /** 커서 필터링 적용 */
  static applyCursor(
    qb: SelectQueryBuilder<any>,
    orderType: 'latest' | 'deadline',
    cursor?: CursorData,
  ) {
    if (!cursor) return;
    const { id } = cursor;
    const date = orderType === 'latest' ? cursor.start_date : cursor.end_date;
    const condition =
      orderType === 'latest'
        ? this.buildLatestCondition(qb.alias)
        : this.buildDeadlineCondition(qb.alias);
    qb.andWhere(condition, { date, id });
  }

  /** next_page 커서 생성 */
  static generateCursor(last: PlaceEntity, orderType: 'latest' | 'deadline'): string | null {
    if (!last) return null;
    const data =
      orderType === 'latest'
        ? { start_date: last.start_date.toISOString(), id: last.id }
        : { end_date: last.end_date.toISOString(), id: last.id };
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }
}
