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
    example: '쇼핑',
    description: '추가하려는 커스텀',
  })
  place_type: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '성수',
    description: '지하철 역',
  })
  subway: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '분위기 있는🌃',
    description: '코스 테마',
    required: false,
  })
  theme?: string;
}
