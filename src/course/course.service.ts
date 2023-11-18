import { Injectable } from '@nestjs/common';
import { DetailResponseDto } from 'src/commons/dto/response.dto';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { SubwayQueryRepository } from 'src/place/subway.query.repository';
import { CourseQueryRepository } from './course.query.repository';
import { CourseRecommendReqDto } from './dto/course.dto';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseQueryRepository: CourseQueryRepository,
    private readonly subwayQueryRepository: SubwayQueryRepository,
    private readonly placeQueryRepository: PlaceQueryRepository,
  ) {}

  async courseRecommend(user, dto: CourseRecommendReqDto) {
    let customs: string[] = dto.customs;
    if (dto.theme_restuarant) {
      customs = customs.filter((item) => item !== '음식점');
      // subway , place_theme , place 세개 테이블 Join
    }
    console.log(customs);
    if (dto.theme_cafe) {
      customs = customs.filter((item) => item !== '카페');
      // subway , place_theme , place 세개 테이블 Join
    }

    if (dto.customs.includes('문화')) {
    }
    const subwayPlaceList = await this.placeQueryRepository.findPlacesOnSubwayLine(customs, dto);
    console.log(subwayPlaceList);

    // 평점 리뷰 없는 "문화"

    // 평점 리뷰 있는 "나머지"
    // 가중치 평균 계산
    // 상위 N개 추출
    // 랜덤

    // 나중에 가중치 삭감 반영

    return DetailResponseDto.from(subwayPlaceList);
  }
}
