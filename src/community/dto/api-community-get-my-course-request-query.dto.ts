import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, IsNotEmpty, Min, Max } from 'class-validator';

export class ApiCommunityGetMyCourseRequestQueryDto {
  @IsOptional()
  @IsInt()
  @ApiProperty({
    example: 0,
    description: '마지막 내 코스 목록 아이디',
    required: false,
  })
  last_id?: number;

  @IsNotEmpty()
  @IsInt()
  @Min(5)
  @Max(50)
  @ApiProperty({
    example: 10,
    description: '한 번에 보여줄 내 코스 목록 개수',
  })
  size: number;
}
