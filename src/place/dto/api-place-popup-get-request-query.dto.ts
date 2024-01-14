import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsInt, IsNotEmpty, Min, Max, IsString, IsIn } from 'class-validator';

export class ApiPlacePopupGetRequestQueryDto {
  @IsOptional()
  @IsInt()
  @Expose()
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
    required: false,
  })
  size?: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['latest', 'deadline'])
  @ApiProperty({
    example: 'latest',
    description: '정렬',
    required: false,
  })
  order: string;
}