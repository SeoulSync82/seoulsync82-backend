import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MyCourseListReqDto {
  @Expose()
  @ApiProperty({
    example: 0,
    description: '마지막 내코스 아이디',
    required: false,
  })
  last_id?: number;

  @Expose()
  @ApiProperty({
    example: 10,
    description: '한 번에 보여줄 내코스 개수',
    required: false,
  })
  size?: number;
}

export class MyCourseListResDto {
  @Expose()
  @ApiProperty({
    example: 1,
    description: '내 코스 id',
  })
  id: number;

  @Expose()
  @ApiProperty({
    example: '6e6df92a8af35a16af80c358d73d54bb',
    description: '내코스 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: 'c152acef58875943b20b5cd511f25902',
    description: '내코스 uuid',
  })
  course_uuid: string;

  @Expose()
  @ApiProperty({
    example: '개지리는 성수역 코스추천',
    description: '내코스 이름',
  })
  course_name: string;

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
