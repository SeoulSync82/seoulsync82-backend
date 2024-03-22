import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class CustomListDto {
  @Expose()
  @ApiProperty({
    example: '100',
    description: '커스텀 갯수',
  })
  RESTAURANT: number;

  @Expose()
  @ApiProperty({
    example: '100',
    description: '커스텀 갯수',
  })
  CAFE: number;

  @Expose()
  @ApiProperty({
    example: '100',
    description: '커스텀 갯수',
  })
  BAR: number;

  @Expose()
  @ApiProperty({
    example: '100',
    description: '커스텀 갯수',
  })
  SHOPPING: number;

  @Expose()
  @ApiProperty({
    example: '100',
    description: '커스텀 갯수',
  })
  CULTURE: number;

  @Expose()
  @ApiProperty({
    example: '100',
    description: '커스텀 갯수',
  })
  ENTERTAINMENT: number;

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
