import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, IsNotEmpty, Min, Max, IsString, IsIn } from 'class-validator';

export class ApiPlaceGetPopupRequestQueryDto {
  @IsOptional()
  @IsInt()
  @ApiProperty({
    example: 0,
    description: '가장 마지막으로 본 팝업 아이디',
    required: false,
  })
  last_id?: number;

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
    example: '"latest" or "deadline"',
    description: '정렬',
    required: false,
  })
  order: string;
}
