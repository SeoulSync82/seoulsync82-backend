import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CoursePlaceInfoDto } from 'src/course/dto/course-place-info.dto';
import { CourseSubwayLineDetailDto } from 'src/course/dto/course-subway-line-detail.dto';
import { CourseSubwayStationDetailDto } from 'src/course/dto/course-subway-station-detail.dto';
import { CourseThemeDetailDto } from 'src/course/dto/course-theme-detail.dto';

export class ApiCourseGetRecommendResponseDto {
  @Expose()
  @ApiProperty({
    example: '077ff3adc0e556148bf7eeb7a0273fb9',
    description: '코스 uuid',
  })
  course_uuid: string;

  @Expose()
  @ApiProperty({
    example: '잠실역, 주변 코스 일정🔥',
    description: '코스 이름',
  })
  course_name: string;

  @Expose()
  @Type(() => CourseSubwayStationDetailDto)
  @ApiProperty({
    description: '지하철 역 상세 정보',
    type: () => CourseSubwayStationDetailDto,
  })
  subway: CourseSubwayStationDetailDto;

  @Expose()
  @Type(() => CourseSubwayStationDetailDto)
  @ApiProperty({
    description: '지하철 호선 상세 정보',
    type: () => CourseSubwayLineDetailDto,
    isArray: true,
  })
  line: CourseSubwayLineDetailDto[];

  @Expose()
  @Type(() => CourseThemeDetailDto)
  @ApiProperty({
    description: '코스 테마',
    type: () => CourseThemeDetailDto,
  })
  theme: CourseThemeDetailDto;

  @Expose()
  @Type(() => CoursePlaceInfoDto)
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
        score: 4.0,
        place_detail: '도미노 피자',
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
        score: 4.0,
        place_detail: '도미노 피자',
      },
    ],
    description: '장소 상세',
    type: () => CoursePlaceInfoDto,
    isArray: true,
  })
  places: CoursePlaceInfoDto[];

  constructor(data?: Partial<ApiCourseGetRecommendResponseDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
export { CourseSubwayStationDetailDto };
