import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ApiCourseGetPlaceCustomizeRequestQueryDto {
  @IsNotEmpty()
  @IsArray()
  @ApiProperty({
    example: [
      'f8af50f3b7aa4125872029a0ef9fbdc3',
      '00f239d44c7141e5942957c2219dd885',
      '00f2fb983eec41a5a980747855752a6b',
    ],
    description: '장소 uuids',
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
  subway_uuid: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '077ff3adc0e556148bf7eeb7a0273fb9',
    description: '테마 uuid',
    required: false,
  })
  theme_uuid?: string;
}
