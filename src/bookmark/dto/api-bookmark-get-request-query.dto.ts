import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, IsNotEmpty, Min, Max } from 'class-validator';

export class ApiBookmarkGetRequestQueryDto {
  @IsOptional()
  @IsInt()
  @ApiProperty({
    example: 0,
    description: '마지막 북마크 아이디',
    required: false,
  })
  last_id?: number;

  @IsNotEmpty()
  @IsInt()
  @Min(5)
  @Max(50)
  @ApiProperty({
    example: 10,
    description: '한 번에 보여줄 북마크 개수',
  })
  size: number;
}
