import { Expose, Type } from 'class-transformer';

export class CustomListDto {
  @Expose()
  음식점: boolean;

  @Expose()
  카페: boolean;

  @Expose()
  술집: boolean;

  @Expose()
  쇼핑: boolean;

  @Expose()
  문화: boolean;

  @Expose()
  놀거리: boolean;

  constructor(data?: Partial<CustomListDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

export class SubwayCustomCheckResDto {
  @Expose()
  @Type(() => CustomListDto)
  customs: CustomListDto[];

  constructor(data?: Partial<SubwayCustomCheckResDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
