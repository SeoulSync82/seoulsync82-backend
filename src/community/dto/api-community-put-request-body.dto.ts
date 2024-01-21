import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Min, Max, IsString, Length, IsNumber } from 'class-validator';

export class ApiCommunityPutRequestBodyDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(5)
  @ApiProperty({
    example: 4.0,
    description: '평점',
  })
  score: number;

  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    example: '추천받은 코스가 정말 좋아요!',
    description: '한줄리뷰',
  })
  review: string;
}
