import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    example: { 음식점: true, 카페: true, 술집: true, 쇼핑: false, 문화: false, 놀거리: false },
    description: '커스텀',
  })
  customs: CustomListDto[];

  constructor(data?: Partial<SubwayCustomCheckResDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
