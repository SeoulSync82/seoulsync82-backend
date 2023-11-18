import { Injectable } from '@nestjs/common';
import { DetailResponseDto } from 'src/commons/dto/response.dto';
import { PlaceEntity } from 'src/entities/place.entity';
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
    const subwayPlaceList: PlaceEntity[] = await this.placeQueryRepository.findPlacesOnSubwayLine(
      customs,
      dto,
    );

    function calculateWeight(subwayPlaceList) {
      return subwayPlaceList.score * Math.log(subwayPlaceList.review_count + 1);
    }

    function getTopWeight(subwayPlaceList, topN) {
      const weightedPlace = subwayPlaceList.map((item) => ({
        ...item,
        weight: calculateWeight(item),
      }));

      return weightedPlace.sort((a, b) => b.weight - a.weight).slice(0, topN);
    }

    const topWeightPlaces = getTopWeight(subwayPlaceList, 10);
    // 가중치 평균을 측정해 상위 N개 추출

    function getRandomElements(topWeightPlaces, n) {
      let tempArray = [...topWeightPlaces];
      const result = [];

      for (let i = 0; i < n && tempArray.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * tempArray.length);
        result.push(tempArray[randomIndex]);
        tempArray.splice(randomIndex, 1);
        // 선택된 요소 제거 - 코스에 같은 type 여러개 있는 case 고려
      }

      return result;
    }

    const randomElements = getRandomElements(topWeightPlaces, 1);
    // 상위 N개중 랜덤한 값 추출

    // 평점 리뷰 없는 "문화"

    // 평점 리뷰 있는 "나머지"
    // 가중치 평균 계산
    // 상위 N개 추출
    // 랜덤

    // 나중에 가중치 삭감 반영

    return DetailResponseDto.from(randomElements);
  }
}
