import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CommunityPostReqDto {
  @Expose()
  @ApiProperty({
    example: '6e6df92a8af35a16af80c358d73d54bb',
    description: '내코스 uuid',
  })
  my_course_uuid: string;

  @Expose()
  @ApiProperty({
    example: '4.0',
    description: '평점',
  })
  score: number;

  @Expose()
  @ApiProperty({
    example: '추천받은 코스가 정말 좋아요!',
    description: '한줄리뷰',
  })
  review: string;
