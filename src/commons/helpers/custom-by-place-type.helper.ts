import { PlaceEntity } from 'src/entities/place.entity';

export function getCustomByPlaceType(place: PlaceEntity, placeType: string): string {
  const detailMapping = {
    음식점: place.cate_name_depth2,
    카페: place.brandname,
    술집: place.brandname,
    쇼핑: place.cate_name_depth1,
    전시: place.top_level_address,
    팝업: place.mainbrand,
    놀거리: place.cate_name_depth1,
  };
  return detailMapping[placeType] || placeType;
}
