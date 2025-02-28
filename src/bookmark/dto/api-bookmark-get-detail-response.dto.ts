import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { bookmarkCoursePlaceDetailDto } from 'src/bookmark/dto/bookmark-course-place-detail.dto';

export class ApiBookmarkGetDetailResponseDto {
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
  place: bookmarkCoursePlaceDetailDto[];

  constructor(data?: Partial<ApiBookmarkGetDetailResponseDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
