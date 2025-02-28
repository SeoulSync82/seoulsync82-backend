import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SubwayCustomListDto } from 'src/subway/dto/subway-custom-list.dto';

export class ApiSubwayGetCheckResponseDto {
  @Expose()
  @Type(() => SubwayCustomListDto)
  @ApiProperty({
    example: { RESTAURANT: 12, CAFE: 3, BAR: 24, SHOPPING: 3, CULTURE: 0, ENTERTAINMENT: 1 },
    description: '커스텀',
  })
  items: SubwayCustomListDto;

  constructor(data?: Partial<ApiSubwayGetCheckResponseDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
