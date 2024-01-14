import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ApiCourseRecommendPostRequestBodyDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '성수',
    description: '지하철 역',
  })
  subway: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '2호선',
    description: '지하철 호선',
  })
  line: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '분위기 있는🌃',
    description: '음식점 테마',
    required: false,
  })
  theme_restaurant?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '인스타 감성💫',
    description: '카페 테마',
    required: false,
  })
  theme_cafe?: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(6)
  @ApiProperty({
    example: ['음식점', '카페', '술집'],
    description: '커스텀',
  })
  customs: string[];
}
