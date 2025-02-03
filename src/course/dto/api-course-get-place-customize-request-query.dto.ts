import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ApiCourseGetPlaceCustomizeRequestQueryDto {
  @IsNotEmpty()
  @IsArray()
  @Transform(({ value }) => value.split(',')) // 콤마로 구분된 문자열을 배열로 변환
  @ApiProperty({
    example:
      '00145054384a4b0d85b4198c6e54404f,00f239d44c7141e5942957c2219dd885,00f2fb983eec41a5a980747855752a6b',
    description: '장소 uuids (콤마로 구분된 문자열)',
  })
  place_uuids: string[];

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'SHOPPING',
    description: '추가하려는 커스텀 ENUM',
  })
  place_type: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '5b1296a2e88611eeb1c70242ac110002',
    description: '지하철 역 uuid',
  })
  station_uuid: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '077ff3adc0e556148bf7eeb7a0273fb9',
    description: '테마 uuid',
    required: false,
  })
  theme_uuid?: string;
}
