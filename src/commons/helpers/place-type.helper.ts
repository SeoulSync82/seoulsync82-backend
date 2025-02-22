import { PLACE_TYPE } from 'src/commons/enum/place-type-enum';

/** PLACE_TYPE 값에 해당하는 키를 반환 */
export const getPlaceTypeKey = (value: string): string => {
  const entry = Object.entries(PLACE_TYPE).find(([, val]) => val === value);
  return entry ? entry[0] : value;
};
