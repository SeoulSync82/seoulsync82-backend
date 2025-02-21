import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { CoursePlaceDto } from 'src/course/dto/course.dto';

export class BookmarkListReqDto {
  @Expose()
  @ApiProperty({
    example: 0,
    description: '마지막 북마크 아이디',
    required: false,
  })
  last_id?: number;

  @Expose()
  @ApiProperty({
    example: 10,
    description: '한 번에 보여줄 북마크 개수',
    required: false,
  })
  size?: number;
}

export class BookmarkListResDto {
  @Expose()
  @ApiProperty({
    example: 1,
    description: '북마크 id',
  })
  id: number;

  @Expose()
  @ApiProperty({
    example: 'c152acef58875943b20b5cd511f25902',
    description: '코스 uuid',
  })
  course_uuid: string;

  @Expose()
  @ApiProperty({
    example: '잠실나루역 주변 코스 일정🔥',
    description: '코스 이름',
  })
  course_name: string;

  @Expose()
  @ApiProperty({
    example: '2871948cc25b589ea0a672a6f060fae3',
    description: '유저 uuid',
  })
  user_uuid: string;

  @Expose()
  @ApiProperty({
    example: '유승모',
    description: '유저 이름',
    required: false,
  })
  user_name: string;

  @Expose()
  @ApiProperty({
    example:
      'https://lh3.googleusercontent.com/a/ACg8ocKAb6iB4pEMNzQ-IjQJHMEvhxKC8tDHn5VL0FIlDK2v=s96-c',
    description: '유저 이미지',
    required: false,
  })
  user_profile_image: string;

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
  @Transform(({ obj }) => obj.course?.customs)
  customs: string;

  @Expose()
  @ApiProperty({
    example: '2023-10-21 00:00:00',
    description: '생성일',
  })
  created_at: Date;
}
export class CourseSaveReqDto {
  @Expose()
  @ApiProperty({
    example: '분위기 있는🌃',
    description: '코스 테마',
  })
  theme?: string;
}

export class MyCourseDetailResDto {
  @Expose()
  @ApiProperty({
    example: '00145054384a4b0d85b4198c6e54404f',
    description: '코스 uuid',
  })
  course_uuid: string;

  @Expose()
  @ApiProperty({
    example: '6e6df92a8af35a16af80c358d73d54bb',
    description: '내 코스 uuid',
  })
  my_course_uuid: string;

  @Expose()
  @ApiProperty({
    example: '잠실나루역 주변 코스 일정🔥',
    description: '코스 이름',
  })
  my_course_name: string;

  @Expose()
  @ApiProperty({
    example: '성수역',
    description: '지하철 역',
  })
  subway: string;

  @Expose()
  @ApiProperty({
    example: '분위기 있는🌃',
    description: '코스 테마',
  })
  theme?: string;

  @Expose()
  @ApiProperty({
    example: '2',
    description: '코스 장소 갯수',
  })
  count: number;

  @Expose()
  @ApiProperty({
    example: [
      {
        sort: 1,
        uuid: '00145054384a4b0d85b4198c6e54404f',
        place_name: '쫄깃즈 키링 팝업스토어',
        place_type: '팝업',
        thumbnail:
          'https://cf-templates-1gyolugg9zn9q-ap-northeast-2.s3.ap-northeast-2.amazonaws.com/store/b4d678db%2C701e%2C482e%2C8a18%2C4b4a4f7a352f',
        address: '서울특별시 종로구 돈화문로11나길 28-1 1호 익선스페이스 A홀',
        latitude: 27.0319456,
        longitude: 37.5070434,
        url: 'https://www.popply.co.kr/popup/608',
        tel: '070-4141-5474',
        score: 4.0,
        review_count: 30,
        brandname: '도미노 피자',
        start_date: '2023-10-21 00:00:00',
        end_date: '2023-12-31 00:00:00',
      },
      {
        sort: 2,
        uuid: '00145054384a4b0d85b4198c6e54404f',
        place_name: '쫄깃즈 키링 팝업스토어',
        place_type: '팝업',
        thumbnail:
          'https://cf-templates-1gyolugg9zn9q-ap-northeast-2.s3.ap-northeast-2.amazonaws.com/store/b4d678db%2C701e%2C482e%2C8a18%2C4b4a4f7a352f',
        address: '서울특별시 종로구 돈화문로11나길 28-1 1호 익선스페이스 A홀',
        latitude: 27.0319456,
        longitude: 37.5070434,
        url: 'https://www.popply.co.kr/popup/608',
        tel: '070-4141-5474',
        score: 4.0,
        review_count: 30,
        brandname: '도미노 피자',
        start_date: '2023-10-21 00:00:00',
        end_date: '2023-12-31 00:00:00',
      },
    ],
    description: '장소 상세',
  })
  place: CoursePlaceDto[];

  constructor(data?: Partial<MyCourseDetailResDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
