import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ApiSubwayGetListResponseDto {
  @Expose()
  @Type(() => SubwayStationDto)
  @ApiProperty({
    example: [
      { uuid: '5b12a4f6e88611eeb1c70242ac110002', station: '신림' },
      {
        uuid: '5b12a585e88611eeb1c70242ac110002',
        station: '봉천',
      },
    ],
    description: '지하철역 호선',
  })
  items: SubwayStationDto[];
}

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
