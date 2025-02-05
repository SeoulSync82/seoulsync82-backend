import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ToBoolean } from 'src/commons/decorators/to-boolean.decorator';
import { NextPageTransform } from '../../commons/decorators/next-page-transform.decorator';

export class ApiCommunityGetRequestQueryDto {
  @IsOptional()
  @ApiProperty({
    example:
      'eyJjcmVhdGVkX2F0IjoiMjAyNC0wMS0xMFQwMDowMDowMC4wMDBaIiwiZW5kX2RhdGUiOiIyMDI0LTA0LTEwVDAwOjAwOjAwLjAwMFoiLCJpZCI6NjUzNjQwfQ==',
    description: '페이징을 위한 커서',
    required: false,
    type: String,
  })
  @NextPageTransform<{
    created_at?: string;
    like?: number;
    id?: number;
  }>((val) => val)
  next_page?: {
    created_at?: string;
    like?: number;
    id?: number;
  };

  @IsNotEmpty()
  @IsInt()
  @Min(5)
  @Max(50)
  @ApiProperty({
    example: 10,
    description: '한 번에 보여줄 커뮤니티 개수',
  })
  size: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: false,
    description: '내가 쓴 게시물',
    required: false,
  })
  @ToBoolean()
  me?: boolean;

  @IsNotEmpty()
  @IsString()
  @IsIn(['latest', 'popular'])
  @ApiProperty({
    example: 'latest',
    description: "'latest' || 'popular'",
    required: false,
  })
  order: 'latest' | 'popular';
}
