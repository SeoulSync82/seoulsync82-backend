import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SubwaylineDto {
  @Expose()
  @ApiProperty({
    example: '077ff3adc0e556148bf7eeb7a0273fb9',
    description: '지하철 호선 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: '1호선',
    description: '지하철 호선',
  })
  line: string;
}
