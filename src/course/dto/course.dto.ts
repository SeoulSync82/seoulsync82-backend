import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

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
    example: '분위기 있는🌃',
    description: '음식점 테마',
    required: false,
  })
  theme_restaurant?: string;

  @Expose()
  @ApiProperty({
    example: '인스타 감성💫',
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
    example: '분위기 있는🌃',
    description: '음식점 테마',
  })
  theme_restaurant?: string;

  @Expose()
  @ApiProperty({
    example: '인스타 감성💫',
    description: '카페 테마',
  })
  theme_cafe?: string;

  @Expose()
  @ApiProperty({
    example: '잠실나루역 주변 코스 일정🔥',
    description: '코스 이름',
  })
  course_name: string;

  @Expose()
  @ApiProperty({
    example: '',
    description: '장소 이미지',
  })
  course_image: string;

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
        uuid: 'f8af50f3b7aa4125872029a0ef9fbdc3',
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
        uuid: 'f8af50f3b7aa4125872029a0ef9fbdc3',
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

  constructor(data?: Partial<CourseRecommendResDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

export class CoursePlaceDto {
  @Expose()
  @ApiProperty({
    example: 1,
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
    example: 27.0319456,
    description: '위도',
  })
  latitude: number;

  @Expose()
  @ApiProperty({
    example: 37.5070434,
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
// export class CourseSaveReqDto {
//   @Expose()
//   @ApiProperty({
//     example: '성수',
//     description: '지하철 역',
//   })
//   subway: string;

//   @Expose()
//   @ApiProperty({
//     example: '2호선',
//     description: '지하철 호선',
//   })
//   line: string;
//   // @Expose()
//   // @ApiProperty({
//   //   example: '',
//   //   description: '장소 이미지',
//   // })
//   // place_image: string;
// }

export class CoursePlaceDetailDto {
  @Expose()
  @ApiProperty({
    example: 1,
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
    example: 27.0319456,
    description: '위도',
  })
  latitude: number;

  @Expose()
  @ApiProperty({
    example: 37.5070434,
    description: '경도',
  })
  longitude: number;

  @Expose()
  @ApiProperty({
    example: 'https://www.popply.co.kr/popup/608',
    description: 'URL',
  })
  @Transform(({ value }) => value ?? undefined)
  url?: string;

  @Expose()
  @ApiProperty({
    example: '02-1234-5678',
    description: '장소 전화번호',
  })
  @Transform(({ value }) => value ?? undefined)
  tel?: string;

  @Expose()
  @ApiProperty({
    example: 4.0,
    description: '평점',
  })
  @Transform(({ value }) => value ?? undefined)
  score?: number;

  @Expose()
  @ApiProperty({
    example: 30,
    description: '리뷰수',
  })
  @Transform(({ value }) => value ?? undefined)
  review_count?: number;

  @Expose()
  @ApiProperty({
    example: '디올',
    description: '메인 브랜드',
  })
  @Transform(({ value }) => value ?? undefined)
  mainbrand?: string;

  @Expose()
  @ApiProperty({
    example: '2023-10-21 00:00:00',
    description: '시작일',
  })
  @Transform(({ value }) => value ?? undefined)
  start_date?: Date;

  @Expose()
  @ApiProperty({
    example: '2023-12-31 00:00:00',
    description: '마감일',
  })
  @Transform(({ value }) => value ?? undefined)
  end_date?: Date;

  @Expose()
  @ApiProperty({
    example: 'KANU(카누)',
    description: '팝업 main 이름',
  })
  @Transform(({ value }) => value ?? undefined)
  brandname?: string;

  @Expose()
  @ApiProperty({
    example: '아쿠아리움',
    description: '장소 상세 카테고리 depth1',
  })
  @Transform(({ value }) => value ?? undefined)
  cate_name_depth1?: string;

  @Expose()
  @ApiProperty({
    example: '한식',
    description: '장소 상세 카테고리 depth2',
  })
  @Transform(({ value }) => value ?? undefined)
  cate_name_depth2?: string;

  @Expose()
  @ApiProperty({
    example: '스타벅스',
    description: '장소 브랜드',
  })
  @Transform(({ value }) => value ?? undefined)
  brand?: string;

  @Expose()
  @ApiProperty({
    example: '리움 미술관',
    description: '전시/팝업 장소',
  })
  @Transform(({ value }) => value ?? undefined)
  top_level_address?: string;
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

export class MyCourseHistoryReqDto {
  @Expose()
  @ApiProperty({
    example: 0,
    description: '마지막 내코스 추천내역 아이디',
    required: false,
  })
  last_id?: number;

  @Expose()
  @ApiProperty({
    example: 10,
    description: '한 번에 보여줄 내코스 추천내역 개수',
    required: false,
  })
  size?: number;
}

export class MyCourseHistoryResDto {
  @Expose()
  @ApiProperty({
    example: 1,
    description: '코스 id',
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
  @Transform(({ obj }) => obj.customs)
  customs: string;

  @Expose()
  @ApiProperty({
    example: '2023-10-21 00:00:00',
    description: '생성일',
  })
  created_at: Date;
}

export class CourseDetailResDto {
  @Expose()
  @ApiProperty({
    example: 'f8af50f3b7aa4125872029a0ef9fbdc3',
    description: '코스 uuid',
  })
  course_uuid: string;

  @Expose()
  @ApiProperty({
    example: true,
    description: '작성된 글인지 체크',
  })
  isPosted: boolean;

  @Expose()
  @ApiProperty({
    example: true,
    description: '작성된 글이라면 내가 좋아요 눌렀는지 체크',
  })
  isLiked?: boolean;

  @Expose()
  @ApiProperty({
    example: true,
    description: '북마크 유무 체크',
  })
  isBookmarked: boolean;

  @Expose()
  @ApiProperty({
    example: '잠실나루역 주변 코스 일정🔥',
    description: '코스 이름',
  })
  course_name: string;

  @Expose()
  @ApiProperty({
    example: '',
    description: '코스 이미지',
  })
  course_image: string;

  @Expose()
  @ApiProperty({
    example: '성수역',
    description: '지하철 역',
  })
  subway: string;

  @Expose()
  @ApiProperty({
    example: '분위기 있는🌃',
    description: '음식점 테마',
  })
  theme_restaurant?: string;

  @Expose()
  @ApiProperty({
    example: '인스타 감성💫',
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
  @ApiProperty({
    example: '음식점, 카페, 술집',
    description: '커스텀',
  })
  @Transform(({ obj }) => obj.customs)
  customs: string;

  @Expose()
  @ApiProperty({
    example: '2023-10-21 00:00:00',
    description: '생성일',
  })
  created_at: Date;

  @Expose()
  @ApiProperty({
    example: [
      {
        sort: 1,
        uuid: 'f8af50f3b7aa4125872029a0ef9fbdc3',
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
        uuid: 'f8af50f3b7aa4125872029a0ef9fbdc3',
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

  constructor(data?: Partial<CourseDetailResDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

export class CoursePlaceListResDto {
  @Expose()
  @ApiProperty({
    example: 'f8af50f3b7aa4125872029a0ef9fbdc3',
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
    example: [
      {
        sort: 1,
        uuid: 'f8af50f3b7aa4125872029a0ef9fbdc3',
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
        cate_name_depth1: '아쿠아리움',
        cate_name_depth2: '한식',
        brand: '스타벅스',
        top_level_address: '리움 미술관',
      },
      {
        sort: 2,
        uuid: 'f8af50f3b7aa4125872029a0ef9fbdc3',
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
        cate_name_depth1: '아쿠아리움',
        cate_name_depth2: '한식',
        brand: '스타벅스',
        top_level_address: '리움 미술관',
      },
    ],
    description: '장소 상세',
  })
  place: CoursePlaceDetailDto[];

  constructor(data?: Partial<CoursePlaceListResDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
