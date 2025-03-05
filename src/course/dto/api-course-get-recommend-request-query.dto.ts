import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ApiCourseGetRecommendRequestQueryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '5b12b0bde88611eeb1c70242ac110002',
    description: '지하철 역 uuid',
  })
  station_uuid: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '9f1fa47a0a1b58cab31a7a0e04248140',
    description: '테마 uuid',
    required: false,
  })
  theme_uuid?: string;
}
