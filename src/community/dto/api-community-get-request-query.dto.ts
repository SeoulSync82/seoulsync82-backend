import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

export class ApiCommunityGetRequestQueryDto {
  @IsOptional()
  @IsInt()
  @ApiProperty({
    example: 0,
    description: '마지막 커뮤니티 아이디',
    required: false,
  })
  last_id?: number;

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
  @Transform(({ value }) => value === 'true')
  me?: boolean;
}
