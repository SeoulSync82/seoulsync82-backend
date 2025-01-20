import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SubwayStationDetail {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '5b1296a2e88611eeb1c70242ac110002',
    description: '지하철 역 uuid',
  })
  uuid: string;

  @ApiProperty({
    example: '성수역',
    description: '지하철 역 이름',
  })
  station: string;
}
export class ThemeDetail {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '077ff3adc0e556148bf7eeb7a0273fb9',
    description: '테마 uuid',
  })
  uuid: string;

  @ApiProperty({
    example: '가성비 좋은 💸',
    description: '테마 이름',
  })
  theme: string;
}

export class ApiCoursePostRecommendSaveRequestBodyDto {
  @Type(() => SubwayStationDetail)
  @ApiProperty({
    description: '코스 지하철',
    type: () => SubwayStationDetail,
  })
  subway: SubwayStationDetail;

  @Type(() => ThemeDetail)
  @ApiProperty({
    description: '코스 테마',
    type: () => ThemeDetail,
  })
  theme: ThemeDetail;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '00145054384a4b0d85b4198c6e54404f',
    description: '코스 uuid',
  })
  course_uuid: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '잠실역, 주변 코스 일정🔥',
    description: '코스 이름',
  })
  course_name: string;

  @IsNotEmpty()
  @IsArray()
  @Type(() => PlaceDetailDto)
  @ApiProperty({
    example: [
      {
        sort: 1,
        uuid: '00145054384a4b0d85b4198c6e54404f',
        place_name: '쫄깃즈 키링 팝업스토어',
        place_type: 'POPUP',
        thumbnail:
          'https://cf-templates-1gyolugg9zn9q-ap-northeast-2.s3.ap-northeast-2.amazonaws.com/store/b4d678db%2C701e%2C482e%2C8a18%2C4b4a4f7a352f',
        address: '서울특별시 종로구 돈화문로11나길 28-1 1호 익선스페이스 A홀',
        latitude: '27.0319456',
        longitude: '37.5070434',
        score: '4.0',
        place_detail: '도미노 피자',
      },
      {
        sort: 2,
        uuid: '00145054384a4b0d85b4198c6e54404f',
        place_name: '쫄깃즈 키링 팝업스토어',
        place_type: 'POPUP',
        thumbnail:
          'https://cf-templates-1gyolugg9zn9q-ap-northeast-2.s3.ap-northeast-2.amazonaws.com/store/b4d678db%2C701e%2C482e%2C8a18%2C4b4a4f7a352f',
        address: '서울특별시 종로구 돈화문로11나길 28-1 1호 익선스페이스 A홀',
        latitude: '27.0319456',
        longitude: '37.5070434',
        score: 4.0,
        place_detail: '도미노 피자',
      },
    ],
    description: '장소 상세',
    type: () => PlaceDetailDto,
    isArray: true,
  })
  places: PlaceDetailDto[];
}

export class PlaceDetailDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: '장소 순서',
  })
  sort: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '00145054384a4b0d85b4198c6e54404f',
    description: '장소 uuid',
  })
  uuid: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '쫄깃즈 키링 팝업스토어',
    description: '장소 이름',
  })
  place_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '팝업',
    description: '장소 종류',
  })
  place_type: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example:
      'https://cf-templates-1gyolugg9zn9q-ap-northeast-2.s3.ap-northeast-2.amazonaws.com/store/b4d678db%2C701e%2C482e%2C8a18%2C4b4a4f7a352f',
    description: '장소 썸네일',
  })
  thumbnail: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '서울특별시 종로구 돈화문로11나길 28-1 1호 익선스페이스 A홀',
    description: '주소',
  })
  address: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '27.0319456',
    description: '위도',
  })
  latitude: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '37.5070434',
    description: '경도',
  })
  longitude: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '4.0',
    description: '평점',
  })
  score?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '도미노 피자',
    description: '장소 추가 설명',
  })
  place_detail?: string;
}
