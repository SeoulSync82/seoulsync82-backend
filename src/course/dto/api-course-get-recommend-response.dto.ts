import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class SubwayStationDetail {
  @Expose()
  @ApiProperty({
    example: '5b1296a2e88611eeb1c70242ac110002',
    description: '지하철 역 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: '성수역',
    description: '지하철 역 이름',
  })
  station: string;
}
export class SubwayLineDetail {
  @Expose()
  @ApiProperty({
    example: 'ebae94e2955f5669b599af4d6991b190',
    description: '지하철 호선 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: '2호선',
    description: '지하철 호선 이름',
  })
  line: string;
}

export class ThemeDetail {
  @Expose()
  @ApiProperty({
    example: '077ff3adc0e556148bf7eeb7a0273fb9',
    description: '테마 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: '가성비 좋은 💸',
    description: '테마 이름',
  })
  theme: string;
}

export class PlaceDetailDto {
  @Expose()
  @ApiProperty({
    example: 1,
    description: '장소 순서',
  })
  sort?: number;

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
    example: 'BAR',
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
  latitude: string;

  @Expose()
  @ApiProperty({
    example: 37.5070434,
    description: '경도',
  })
  longitude: string;

  @Expose()
  @ApiProperty({
    example: 4.0,
    description: '평점',
  })
  score?: string;

  @Expose()
  @ApiProperty({
    example: '도미노 피자',
    description: '장소 추가 설명',
  })
  place_detail?: string;
}

export class ApiCourseGetRecommendResponseDto {
  @Expose()
  @ApiProperty({
    example: '077ff3adc0e556148bf7eeb7a0273fb9',
    description: '코스 uuid',
  })
  course_uuid: string;

  @Expose()
  @ApiProperty({
    example: '주변 코스 일정🔥',
    description: '코스 이름',
  })
  course_name: string;

  @Expose()
  @Type(() => SubwayStationDetail)
  @ApiProperty({
    description: '지하철 역 상세 정보',
    type: () => SubwayStationDetail,
  })
  subway: SubwayStationDetail;

  @Expose()
  @Type(() => SubwayStationDetail)
  @ApiProperty({
    description: '지하철 호선 상세 정보',
    type: () => SubwayLineDetail,
    isArray: true,
  })
  line: SubwayLineDetail[];

  @Expose()
  @Type(() => ThemeDetail)
  @ApiProperty({
    description: '코스 테마',
    type: () => ThemeDetail,
  })
  theme: ThemeDetail;

  @Expose()
  @Type(() => PlaceDetailDto)
  @ApiProperty({
    /** 
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
        score: 4.0,
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
        latitude: 27.0319456,
        longitude: 37.5070434,
        score: 4.0,
        place_detail: '도미노 피자',
      },
    ],
    */
    description: '장소 상세',
    type: () => PlaceDetailDto,
    isArray: true,
  })
  places: PlaceDetailDto[];

  constructor(data?: Partial<ApiCourseGetRecommendResponseDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
