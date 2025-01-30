import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { NextPageTransform } from '../../commons/decorators/next-page-transform.decorator';

export class ApiPlaceGetPopupRequestQueryDto {
  @IsOptional()
  @ApiProperty({
    example:
      'eyJzdGFydF9kYXRlIjoiMjAyNS0wMS0xMFQwMDowMDowMC4wMDBaIiwiZW5kX2RhdGUiOiIyMDI1LTA0LTEwVDAwOjAwOjAwLjAwMFoiLCJpZCI6NjUzNjQwfQ==',
    description: '페이징을 위한 커서',
    required: false,
    type: String,
  })
  @NextPageTransform<{
    start_date?: string;
    end_date?: string;
    id?: number;
  }>((val) => val)
  next_page?: {
    start_date?: string;
    end_date?: string;
    id?: number;
  };

  @IsNotEmpty()
  @IsInt()
  @Min(5)
  @Max(50)
  @ApiProperty({
    example: 10,
    description: '한 번에 보여질 팝업 수',
  })
  size: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['latest', 'deadline'])
  @ApiProperty({
    example: 'latest',
    description: "'latest' || 'deadline'",
    required: false,
  })
  order: 'latest' | 'deadline';
}
