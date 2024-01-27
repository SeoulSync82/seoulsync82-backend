import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CustomListDto, SubwayCustomCheckResDto } from 'src/place/dto/subway.dto';

export class ApiCourseSubwayCheckGetResponseDto {
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
