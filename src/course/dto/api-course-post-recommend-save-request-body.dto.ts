import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CoursePlaceDetailRequestDto } from 'src/course/dto/course-place-detail-request.dto';

export class ApiCoursePostRecommendSaveRequestBodyDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '5b1296a2e88611eeb1c70242ac110002',
    description: '지하철 역 uuid',
  })
  station_uuid: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '077ff3adc0e556148bf7eeb7a0273fb9',
    description: '테마 uuid',
    required: false,
  })
  theme_uuid?: string;

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
  @ArrayMinSize(3)
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => CoursePlaceDetailRequestDto)
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
    type: () => CoursePlaceDetailRequestDto,
    isArray: true,
  })
  places: CoursePlaceDetailRequestDto[];
}
