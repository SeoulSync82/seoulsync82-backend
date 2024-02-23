import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CustomListDto, SubwayCustomCheckResDto } from 'src/place/dto/subway.dto';

export class ApiSubwayGetCheckResponseDto {
  @Expose()
  @Type(() => CustomListDto)
  @ApiProperty({
    example: { 음식점: 12, 카페: 3, 술집: 24, 쇼핑: 3, 문화: 0, 놀거리: 1 },
    description: '커스텀',
  })
  customs: CustomListDto[];

  constructor(data?: Partial<ApiSubwayGetCheckResponseDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
