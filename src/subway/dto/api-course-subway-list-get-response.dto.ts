import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CustomListDto, SubwayCustomCheckResDto } from 'src/place/dto/subway.dto';

export class ApiCourseSubwayListGetResponseDto {
  @Expose()
  @ApiProperty({
    example: ['도봉산', '방학', '월계'],
    description: '지하철역 이름',
  })
  name: [];
}
