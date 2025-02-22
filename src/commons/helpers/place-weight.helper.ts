import { PlaceEntity } from '../../entities/place.entity';

/** 가중치 계산 함수, 최근 추천된 장소는 가중치를 감소 */
export const calculateWeight = (
  customPlace: PlaceEntity,
  userHistoryCourse: { place_uuid: string }[] = [],
): number => {
  let weight = customPlace.score * Math.log(customPlace.review_count + 1);
  if (userHistoryCourse.some((item) => item.place_uuid === customPlace.uuid)) {
    weight /= 2; // 최근 추천된 장소는 가중치 감소
  }
  return weight;
};

/** 상위 N개 장소 추출 함수 */
export const getTopWeight = (
  places: PlaceEntity[],
  topN: number,
  userHistoryCourse: { place_uuid: string }[] = [],
) => {
  const weightedPlaces = places.map((place) => ({
    ...place,
    weight: calculateWeight(place, userHistoryCourse),
  }));
  return weightedPlaces.sort((a, b) => b.weight - a.weight).slice(0, topN);
};

export const getRandomShuffleElements = <T>(places: T[], count: number): T[] => {
  const shuffled = fisherYatesShuffle(places);
  return shuffled.slice(0, count);
};

/** Fisher–Yates Shuffle 알고리즘 */
function fisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
