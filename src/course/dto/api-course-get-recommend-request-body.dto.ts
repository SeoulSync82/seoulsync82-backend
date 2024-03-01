import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ApiCourseGetRecommendRequestBodyDto {
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
