import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  IsNotEmpty,
  Min,
  Max,
  IsString,
  MinLength,
  Length,
} from 'class-validator';

export class ApiSearchGetRequestQueryDto {
  @IsOptional()
  @IsInt()
  @ApiProperty({
    example: 0,
    description: '마지막 장소 아이디',
    required: false,
  })
  last_id?: number;

  @IsNotEmpty()
  @IsInt()
  @Min(5)
  @Max(50)
  @ApiProperty({
    example: 10,
    description: '한 번에 보여줄 장소 개수',
  })
  size: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @ApiProperty({
    example: '쫄깃즈 키링 팝업스토어',
    description: '장소 이름',
  })
  search: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  @ApiProperty({
    example: 'restaurant',
    description: '장소 타입',
    required: false,
  })
  place_type: string;
}
