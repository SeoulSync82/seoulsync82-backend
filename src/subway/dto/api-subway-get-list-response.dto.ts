import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SubwayStationDto } from 'src/subway/dto/subway-station.dto';

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
