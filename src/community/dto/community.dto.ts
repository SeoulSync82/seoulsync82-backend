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
}
export class CommunityListReqDto {
  @Expose()
  @ApiProperty({
    example: 0,
    description: '마지막 커뮤니티 아이디',
    required: false,
  })
  last_id?: number;

  @Expose()
  @ApiProperty({
    example: 10,
    description: '한 번에 보여줄 커뮤니티 개수',
    required: false,
  })
  size?: number;
}

export class CommunityListResDto {
  @Expose()
  @ApiProperty({
    example: 1,
    description: '커뮤니티 id',
  })
  id: number;

  @Expose()
  @ApiProperty({
    example: '6e6df92a8af35a16af80c358d73d54bb',
    description: '커뮤니티 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: '6e6df92a8af35a16af80c358d73d54bb',
    description: '내코스 uuid',
  })
  my_course_uuid: string;

  @Expose()
  @ApiProperty({
    example: '개지리는 성수역 코스추천',
    description: '내코스 이름',
  })
  my_course_name: string;

  @Expose()
  @ApiProperty({
    example: 'c152acef58875943b20b5cd511f25902',
    description: '내코스 uuid',
  })
  course_uuid: string;

  @Expose()
  @ApiProperty({
    example: '',
    description: '장소 이름',
  })
  course_image: string;

  @Expose()
  @ApiProperty({
    example: '성수',
    description: '지하철 역',
  })
  subway: string;

  @Expose()
  @ApiProperty({
    example: '2호선',
    description: '지하철 호선',
  })
  line: string;

  @Expose()
  @ApiProperty({
    example: '2023-10-21 00:00:00',
    description: '생성일',
  })
  created_at: Date;
}
