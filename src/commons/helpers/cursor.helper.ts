import { SelectQueryBuilder } from 'typeorm';
import { PlaceEntity } from '../../entities/place.entity';

type CursorData = {
  start_date?: string;
  end_date?: string;
  id?: number;
};

export class CursorPaginationHelper {
  static applyCursor(
    qb: SelectQueryBuilder<any>,
    orderType: 'latest' | 'deadline',
    cursorObj?: CursorData,
  ) {
    if (!cursorObj) return;

    if (orderType === 'latest') {
      qb.andWhere('(place.start_date < :date OR (place.start_date = :date AND place.id < :id))', {
        date: cursorObj.start_date,
        id: cursorObj.id,
      });
    } else {
      qb.andWhere('(place.end_date > :date OR (place.end_date = :date AND place.id > :id))', {
        date: cursorObj.end_date,
        id: cursorObj.id,
      });
    }
  }

  static generateCursor(lastItem: PlaceEntity, orderType: 'latest' | 'deadline') {
    const cursorData =
      orderType === 'latest'
        ? { start_date: lastItem.start_date.toISOString(), id: lastItem.id }
        : { end_date: lastItem.end_date.toISOString(), id: lastItem.id };

    // 객체 → JSON 문자열 → Base64
    const jsonString = JSON.stringify(cursorData);
    return Buffer.from(jsonString).toString('base64');
  }
}
