import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min, Max, Matches, IsString, Length } from 'class-validator';

export class ApiCommunityPutRequestBodyDto {
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(5)
  @Matches(/^\d(\.\d)?$/)
  @ApiProperty({
    example: '4.0',
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
