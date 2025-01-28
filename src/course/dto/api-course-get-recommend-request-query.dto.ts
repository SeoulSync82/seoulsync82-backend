import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ApiCourseGetRecommendRequestQueryDto {
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
