import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

export class ApiNoticeGetRequestQueryDto {
  @IsOptional()
  @IsInt()
  @ApiProperty({
    example: 0,
    description: '마지막 공지사항 아이디',
    required: false,
  })
  last_id?: number;

  @IsNotEmpty()
  @IsInt()
  @Min(5)
  @Max(50)
  @ApiProperty({
    example: 10,
    description: '한 번에 보여줄 공지사항 개수',
  })
  size: number;
}
