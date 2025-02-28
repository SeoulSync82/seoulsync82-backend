import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SubwayStationDto {
  @Expose()
  @ApiProperty({
    example: '077ff3adc0e556148bf7eeb7a0273fb9',
    description: '지하철 역 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: '1호선',
    description: '지하철 역',
  })
  station: string;
}
