import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { CoursePlaceDto, CourseRecommendResDto } from './course.dto';

export class ApiCoursePostRecommendSaveResponseDto {
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
    example: ['2호선', '7호선'],
    description: '지하철 호선',
  })
  line: string[];

  @Expose()
  @ApiProperty({
    example: '분위기 있는 🌃',
    description: '코스 테마',
  })
  theme?: string;

  @Expose()
  @ApiProperty({
    example: '잠실나루역, 주변 코스 일정 🔥',
    description: '코스 이름',
  })
  course_name: string;

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
        latitude: '27.0319456',
        longitude: '37.5070434',
        score: '4.0',
        review_count: 30,
        place_detail: '도미노 피자',
      },
      {
        sort: 2,
        uuid: 'f8af50f3b7aa4125872029a0ef9fbdc3',
        place_name: '쫄깃즈 키링 팝업스토어',
        place_type: '팝업',
        thumbnail:
          'https://cf-templates-1gyolugg9zn9q-ap-northeast-2.s3.ap-northeast-2.amazonaws.com/store/b4d678db%2C701e%2C482e%2C8a18%2C4b4a4f7a352f',
        address: '서울특별시 종로구 돈화문로11나길 28-1 1호 익선스페이스 A홀',
        latitude: '27.0319456',
        longitude: '37.5070434',
        score: '4.0',
        review_count: 30,
        place_detail: '도미노 피자',
      },
    ],
    description: '장소 상세',
  })
  place: PlaceDetailDto[];

  constructor(data?: Partial<ApiCoursePostRecommendSaveResponseDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

export class PlaceDetailDto {
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
    example: '27.0319456',
    description: '위도',
  })
  latitude: string;

  @Expose()
  @ApiProperty({
    example: '37.5070434',
    description: '경도',
  })
  longitude: string;

  @Expose()
  @ApiProperty({
    example: '4.0',
    description: '평점',
  })
  score?: string;

  @Expose()
  @ApiProperty({
    example: 30,
    description: '리뷰수',
  })
  review_count?: number;

  @Expose()
  @ApiProperty({
    example: '도미노 피자',
    description: '장소 추가 설명',
  })
  place_detail?: string;
}
