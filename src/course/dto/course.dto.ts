import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CourseRecommendReqDto {
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
    example: '가성비 좋은',
    description: '음식점 테마',
    required: false,
  })
  theme_restaurant?: string;

  @Expose()
  @ApiProperty({
    example: '인스타 감성',
    description: '카페 테마',
    required: false,
  })
  theme_cafe?: string;

  @Expose()
  @ApiProperty({
    example: ['음식점', '카페', '술집'],
    description: '커스텀',
  })
  customs: string[];
}

export class CourseRecommendResDto {
  @Expose()
  @ApiProperty({
    example: 'f8af50f3b7aa4125872029a0ef9fbdc3',
    description: '코스 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: '성수역',
    description: '지하철 역',
  })
  subway: string;

  @Expose()
  @ApiProperty({
    example: '가성비 좋은',
    description: '음식점 테마',
  })
  theme_restaurant?: string;

  @Expose()
  @ApiProperty({
    example: '인스타 감성',
    description: '카페 테마',
  })
  theme_cafe?: string;

  @Expose()
  @ApiProperty({
    example: '2',
    description: '코스 장소 갯수',
  })
  count: number;

  @Expose()
  @ApiProperty()
  place: CoursePlaceDto[];

  constructor(data?: Partial<CourseRecommendResDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

export class CoursePlaceDto {
  @Expose()
  @ApiProperty({
    example: '1',
    description: '장소 순서',
  })
  sort: number;

  @Expose()
  @ApiProperty({
    example: 'f8af50f3b7aa4125872029a0ef9fbdc3',
    description: '장소 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: '쫄깃즈 키링 팝업스토어',
    description: '장소 이름',
  })
  place_name: string;

  @Expose()
  @ApiProperty({
    example: '팝업',
    description: '장소 종류',
  })
  place_type: string;

  @Expose()
  @ApiProperty({
    example:
      'https://cf-templates-1gyolugg9zn9q-ap-northeast-2.s3.ap-northeast-2.amazonaws.com/store/b4d678db%2C701e%2C482e%2C8a18%2C4b4a4f7a352f',
    description: '장소 썸네일',
  })
  thumbnail: string;

  @Expose()
  @ApiProperty({
    example: '서울특별시 종로구 돈화문로11나길 28-1 1호 익선스페이스 A홀',
    description: '주소',
  })
  address: string;

  @Expose()
  @ApiProperty({
    example: '0',
    description: '위도',
  })
  latitude: number;

  @Expose()
  @ApiProperty({
    example: '0',
    description: '경도',
  })
  longitude: number;

  @Expose()
  @ApiProperty({
    example: 'https://www.popply.co.kr/popup/608',
    description: 'URL',
  })
  url: string;

  @Expose()
  @ApiProperty({
    example: '070-4141-5474',
    description: '전화번호',
  })
  tel: string;

  @Expose()
  @ApiProperty({
    example: 4.0,
    description: '평점',
  })
  score: number;

  @Expose()
  @ApiProperty({
    example: 30,
    description: '리뷰수',
  })
  review_count: number;

  @Expose()
  @ApiProperty({
    example: '도미노 피자',
    description: '브랜드 네임',
  })
  brandname: string;

  @Expose()
  @ApiProperty({
    example: '2023-10-21 00:00:00',
    description: '시작일',
  })
  start_date: Date;

  @Expose()
  @ApiProperty({
    example: '2023-12-31 00:00:00',
    description: '마감일',
  })
  end_date: Date;
}

export class MyCourseDetailResDto {
  @Expose()
  @ApiProperty({
    example: 'f8af50f3b7aa4125872029a0ef9fbdc3',
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
    example: '개지리는 성수역 코스추천',
    description: '내 코스 이름',
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
    example: '가성비 좋은',
    description: '음식점 테마',
  })
  theme_restaurant?: string;

  @Expose()
  @ApiProperty({
    example: '인스타 감성',
    description: '카페 테마',
  })
  theme_cafe?: string;

  @Expose()
  @ApiProperty({
    example: '2',
    description: '코스 장소 갯수',
  })
  count: number;

  @Expose()
  @ApiProperty()
  place: CoursePlaceDto[];

  constructor(data?: Partial<MyCourseDetailResDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
export class CourseSaveReqDto {
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
  // @Expose()
  // @ApiProperty({
  //   example: '',
  //   description: '장소 이미지',
  // })
  // place_image: string;
}
export class SubwayCustomsCheckReqDto {
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
  // @Expose()
  // @ApiProperty({
  //   example: '',
  //   description: '장소 이미지',
  // })
  // place_image: string;
}
