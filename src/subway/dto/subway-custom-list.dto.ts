import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SubwayCustomListDto {
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

  constructor(data?: Partial<SubwayCustomListDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
