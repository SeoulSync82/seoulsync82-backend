import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ApiSubwayGetListResponseDto {
  @Expose()
  @ApiProperty({
    example: '1호선',
    description: '지하철역 호선',
  })
  line: string;

  @Expose()
  @ApiProperty({
    example: ['도봉산', '방학', '월계'],
    description: '지하철역 이름',
  })
  name: [];
}
