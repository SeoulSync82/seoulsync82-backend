import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { getTsBuildInfoEmitOutputFilePath } from 'typescript';

export class PlaceReadDto {
  @Expose()
  @ApiProperty({
    example: 0,
    description: '마지막 장소 아이디',
    required: false,
  })
  last_id?: number;

  @Expose()
  @ApiProperty({
    example: 10,
    description: '한 번에 보여줄 장소 개수',
  })
  size?: number;

  @Expose()
  @ApiProperty({
    example: 'latest',
    description: '정렬',
    required: false,
  })
  order: string;
}

export class CultureListDto {
  @ApiProperty({
    example: 535,
    description: '장소 아이디',
  })
  id: number;

  @Expose()
  @ApiProperty({
    example: 'f8af50f3b7aa4125872029a0ef9fbdc3',
    description: '장소 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example:
      'https://cf-templates-1gyolugg9zn9q-ap-northeast-2.s3.ap-northeast-2.amazonaws.com/store/b4d678db%2C701e%2C482e%2C8a18%2C4b4a4f7a352f',
    description: '장소 썸네일',
  })
  thumbnail: string;

  @Expose()
  @ApiProperty({
    example: '전시',
    description: '장소 타입',
  })
  place_type: string;

  @Expose()
  @ApiProperty({
    example: '쫄깃즈 키링 팝업스토어',
    description: '장소 이름',
  })
  place_name: string;

  @Expose()
  @ApiProperty({
    example: '서울특별시 종로구 돈화문로11나길 28-1 1호 익선스페이스 A홀',
    description: '주소',
  })
  address: string;

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

  @Expose()
  @ApiProperty({
    example: ' 월~금요일 10:00~18:00· 토요일 12:00~19:00',
    description: '전시 영업 시간',
  })
  @Transform(({ value }) => value ?? undefined)
  operation_time?: string;

  @Expose()
  @ApiProperty({
    example: ' 일요일 휴관',
    description: '전시 휴무일',
  })
  @Transform(({ value }) => value ?? undefined)
  closed_days?: string;

  @Expose()
  @ApiProperty({
    example: ' 무료',
    description: '전시 입장료',
  })
  @Transform(({ value }) => value ?? undefined)
  entrance_fee?: string;

  @Expose()
  @ApiProperty({
    example: 'KANU(카누)',
    description: '팝업 main 이름',
  })
  @Transform(({ value }) => value ?? undefined)
  brandname?: string;

  @Expose()
  @ApiProperty({
    example: '카누,커피,크리스마스,팝업스토어,미디어아트,시음,레이어57',
    description: '팝업 해시태그',
  })
  @Transform(({ value }) => value ?? undefined)
  hashtag?: string;

  @Expose()
  @ApiProperty({
    example: '서울특별시 성동구',
    description: '전시/팝업 장소',
  })
  top_level_address: string;
}

export class CultureDto {
  @ApiProperty({
    example: 535,
    description: '장소 아이디',
  })
  id: number;

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

  @Expose()
  @ApiProperty({
    example: ' 월~금요일 10:00~18:00· 토요일 12:00~19:00',
    description: '전시 영업 시간',
  })
  @Transform(({ value }) => value ?? undefined)
  operation_time?: string;

  @Expose()
  @ApiProperty({
    example: ' 일요일 휴관',
    description: '전시 휴무일',
  })
  @Transform(({ value }) => value ?? undefined)
  closed_days?: string;

  @Expose()
  @ApiProperty({
    example: ' 무료',
    description: '전시 입장료',
  })
  @Transform(({ value }) => value ?? undefined)
  entrance_fee?: string;

  @Expose()
  @ApiProperty({
    example: 'KANU(카누)',
    description: '팝업 main 이름',
  })
  @Transform(({ value }) => value ?? undefined)
  brandname?: string;

  @Expose()
  @ApiProperty({
    example: '카누,커피,크리스마스,팝업스토어,미디어아트,시음,레이어57',
    description: '팝업 해시태그',
  })
  @Transform(({ value }) => value ?? undefined)
  hashtag?: string;

  @Expose()
  @ApiProperty({
    example: '서울특별시 성동구',
    description: '전시/팝업 장소',
  })
  top_level_address: string;
}

export class PlaceDetailResDto {
  @ApiProperty({
    example: 535,
    description: '장소 아이디',
  })
  id: number;

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
    example: ' 월~금요일 10:00~18:00· 토요일 12:00~19:00',
    description: '전시 영업 시간',
  })
  @Transform(({ value }) => value ?? undefined)
  operation_time?: string;

  @Expose()
  @ApiProperty({
    example: ' 일요일 휴관',
    description: '전시 휴무일',
  })
  @Transform(({ value }) => value ?? undefined)
  closed_days?: string;

  @Expose()
  @ApiProperty({
    example: ' 무료',
    description: '전시 입장료',
  })
  @Transform(({ value }) => value ?? undefined)
  entrance_fee?: string;

  @Expose()
  @ApiProperty({
    example: 'KANU(카누)',
    description: '팝업 main 이름',
  })
  @Transform(({ value }) => value ?? undefined)
  brandname?: string;

  @Expose()
  @ApiProperty({
    example: '카누,커피,크리스마스,팝업스토어,미디어아트,시음,레이어57',
    description: '팝업 해시태그',
  })
  @Transform(({ value }) => value ?? undefined)
  hashtag?: string;

  @Expose()
  @ApiProperty({
    example: '서울특별시 성동구',
    description: '전시/팝업 장소',
  })
  @Transform(({ value }) => value ?? undefined)
  top_level_address?: string;

  @Expose()
  @ApiProperty({
    example: '디올',
    description: '메인 브랜드',
  })
  @Transform(({ value }) => value ?? undefined)
  mainbrand?: string;

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
    example: 'https://www.popply.co.kr/popup/608',
    description: 'URL',
  })
  @Transform(({ value }) => value ?? undefined)
  url?: string;
}
export class ExhibitionDto {
  @ApiProperty({
    example: 535,
    description: '장소 아이디',
  })
  id: number;

  @Expose()
  @ApiProperty({
    example: 'f8af50f3b7aa4125872029a0ef9fbdc3',
    description: '장소 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: '팝업',
    description: '장소 종류',
  })
  place_type: string;

  @Expose()
  @ApiProperty({
    example: '쫄깃즈 키링 팝업스토어',
    description: '장소 이름',
  })
  place_name: string;

  @Expose()
  @ApiProperty({
    example: '서울특별시 종로구 돈화문로11나길 28-1 1호 익선스페이스 A홀',
    description: '주소',
  })
  address: string;

  @Expose()
  @ApiProperty({
    example:
      'https://cf-templates-1gyolugg9zn9q-ap-northeast-2.s3.ap-northeast-2.amazonaws.com/store/b4d678db%2C701e%2C482e%2C8a18%2C4b4a4f7a352f',
    description: '장소 썸네일',
  })
  thumbnail: string;

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

  @Expose()
  @ApiProperty({
    example: ' 월~금요일 10:00~18:00· 토요일 12:00~19:00',
    description: '전시 영업 시간',
  })
  @Transform(({ value }) => value ?? undefined)
  operation_time?: string;

  @Expose()
  @ApiProperty({
    example: ' 일요일 휴관',
    description: '전시 휴무일',
  })
  @Transform(({ value }) => value ?? undefined)
  closed_days?: string;

  @Expose()
  @ApiProperty({
    example: ' 무료',
    description: '전시 입장료',
  })
  @Transform(({ value }) => value ?? undefined)
  entrance_fee?: string;

  @Expose()
  @ApiProperty({
    example: '서울특별시 성동구',
    description: '전시/팝업 장소',
  })
  top_level_address: string;
}

export class PopupDto {
  @ApiProperty({
    example: 535,
    description: '장소 아이디',
  })
  id: number;

  @Expose()
  @ApiProperty({
    example: 'f8af50f3b7aa4125872029a0ef9fbdc3',
    description: '장소 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: '팝업',
    description: '장소 종류',
  })
  place_type: string;

  @Expose()
  @ApiProperty({
    example: '쫄깃즈 키링 팝업스토어',
    description: '장소 이름',
  })
  place_name: string;

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

  @Expose()
  @ApiProperty({
    example: 'KANU(카누)',
    description: '팝업 main 이름',
  })
  @Transform(({ value }) => value ?? undefined)
  brandname?: string;

  @Expose()
  @ApiProperty({
    example: '카누,커피,크리스마스,팝업스토어,미디어아트,시음,레이어57',
    description: '팝업 해시태그',
  })
  @Transform(({ value }) => value ?? undefined)
  hashtag?: string;

  @Expose()
  @ApiProperty({
    example: '서울특별시 성동구',
    description: '전시/팝업 장소',
  })
  top_level_address: string;
}
