import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SubwaylineDto } from 'src/subway/dto/subway-line.dto';

export class ApiSubwayGetLineResponseDto {
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
  items: SubwaylineDto[];
}
