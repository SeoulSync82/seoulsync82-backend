import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CourseSubwayLineDetailDto {
  @Expose()
  @ApiProperty({
    example: 'ebae94e2955f5669b599af4d6991b190',
    description: '지하철 호선 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: '2호선',
    description: '지하철 호선 이름',
  })
  line: string;
}
