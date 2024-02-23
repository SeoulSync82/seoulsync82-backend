import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class ApiCommunityGetMyCourseResponseDto {
  @Expose()
  @ApiProperty({
    example: 1,
    description: '내 코스 id',
  })
  id: number;

  @Expose()
  @ApiProperty({
    example: 'c152acef58875943b20b5cd511f25902',
    description: '코스 uuid',
  })
  @Transform(({ obj }) => obj.uuid)
  course_uuid: string;

  @Expose()
  @ApiProperty({
    example: '잠실나루역 주변 코스 일정🔥',
    description: '코스 이름',
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
    example: '음식점, 카페, 술집',
    description: '커스텀',
  })
  @Transform(({ obj }) => obj?.customs)
  customs: string;

  @Expose()
  @ApiProperty({
    example: '2023-10-21 00:00:00',
    description: '생성일',
  })
  created_at: Date;

  @Expose()
  @ApiProperty({
    example: 'true',
    description: '내가 작성한 글인지',
  })
  isPosted: boolean;
}
