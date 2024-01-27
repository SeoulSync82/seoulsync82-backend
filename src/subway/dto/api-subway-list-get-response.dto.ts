import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { CustomListDto, SubwayCustomCheckResDto } from 'src/place/dto/subway.dto';

export class ApiSubwayListGetResponseDto {
  @Expose()
  @Transform(({ obj }) => obj.line)
  @ApiProperty({
    example: '1호선',
    description: '지하철역 호선',
  })
  line: string;

  @Expose()
  @Transform(({ obj }) => obj.name)
  @ApiProperty({
    example: ['도봉산', '방학', '월계'],
    description: '지하철역 이름',
  })
  name: [];
}
