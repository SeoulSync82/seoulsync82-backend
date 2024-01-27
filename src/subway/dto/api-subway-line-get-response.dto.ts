import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ApiSubwayLineGetResponseDto {
  @Expose()
  @Type(() => SubwaylineDto)
  @ApiProperty({
    example: [
      { uuid: '077ff3adc0e556148bf7eeb7a0273fb9', line: '1호선' },
      {
        uuid: 'ebae94e2955f5669b599af4d6991b190',
        line: '2호선',
      },
    ],
    description: '지하철역 호선',
  })
  subway: SubwaylineDto[];
}

export class SubwaylineDto {
  @Expose()
  @ApiProperty({
    example: '077ff3adc0e556148bf7eeb7a0273fb9',
    description: '지하철 역 호선 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: '1호선',
    description: '지하철 역 호선',
  })
  line: string;
}
