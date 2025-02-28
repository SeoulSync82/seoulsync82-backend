import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CourseSubwayStationDetailRequestDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '5b1296a2e88611eeb1c70242ac110002',
    description: '지하철 역 uuid',
  })
  uuid: string;

  @ApiProperty({
    example: '성수역',
    description: '지하철 역 이름',
  })
  station: string;
}
