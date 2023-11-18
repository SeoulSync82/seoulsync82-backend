import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DetailResponseDto } from 'src/commons/dto/response.dto';
import { generateUUID } from 'src/commons/util/uuid';
import { PlaceEntity } from 'src/entities/place.entity';
import { PlaceQueryRepository } from 'src/place/place.query.repository';
import { SubwayQueryRepository } from 'src/place/subway.query.repository';
import { CourseQueryRepository } from './course.query.repository';
import { CoursePlaceDto, CourseRecommendReqDto, CourseRecommendResDto } from './dto/course.dto';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseQueryRepository: CourseQueryRepository,
    private readonly subwayQueryRepository: SubwayQueryRepository,
    private readonly placeQueryRepository: PlaceQueryRepository,
  ) {}

  async courseRecommend(user, dto: CourseRecommendReqDto) {
    let customs: string[] = dto.customs;

    const countCustoms = dto.customs.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    let placeNonSorting = [];

    if (dto.theme_restaurant) {
      customs = customs.filter((item) => item !== '음식점');
      // 추후 subway , place_theme , place 세개 테이블 Join
    }

    if (dto.theme_cafe) {
      customs = customs.filter((item) => item !== '카페');
      // 추후 subway , place_theme , place 세개 테이블 Join
    }

    if (dto.customs.includes('문화')) {
      const subwayCultureList: PlaceEntity[] =
        await this.placeQueryRepository.findSubwayCultureList(dto);

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
      // 문화는 리뷰,평점 없어서 그냥 랜덤 N개
      const ramdomCultures = getRandomElements(subwayCultureList, countCustoms['문화']);
      placeNonSorting.push(...ramdomCultures);

      customs = customs.filter((item) => item !== '문화');
    }

    const subwayPlaceList: PlaceEntity[] = await this.placeQueryRepository.findSubwayPlaceList(
      customs,
      dto,
    );

    for (const custom in countCustoms) {
      if (custom !== '문화') {
        const customPlace = subwayPlaceList.filter((item) => item.place_type === custom);
        // console.log(customPlace);
        function calculateWeight(customPlace) {
          return customPlace.score * Math.log(customPlace.review_count + 1);
        }

        function getTopWeight(customPlace, topN) {
          const weightedPlace = customPlace.map((item) => ({
            ...item,
            weight: calculateWeight(item),
          }));

          return weightedPlace.sort((a, b) => b.weight - a.weight).slice(0, topN);
        }

        const topWeightPlaces = getTopWeight(customPlace, 10);
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

        const randomplaces = getRandomElements(topWeightPlaces, countCustoms[custom]);
        // 상위 N개중 랜덤한 값 추출
        placeNonSorting.push(...randomplaces);
      }
    }

    const placeSorting: CoursePlaceDto[] = [];

    for (const [index, place_type] of dto.customs.entries()) {
      let customSortingPlace;
      if (place_type === '문화') {
        customSortingPlace = placeNonSorting.filter(
          (item) => item.place_type === '전시' || item.place_type === '팝업',
        );
      } else {
        customSortingPlace = placeNonSorting.filter((item) => item.place_type === place_type);
      }
      placeNonSorting = placeNonSorting.filter((item) => item !== customSortingPlace[0]);
      // sorting한 장소는 기존 placeNonSorting에서 제거

      const coursePlaceDto: CoursePlaceDto = plainToInstance(
        CoursePlaceDto,
        customSortingPlace[0],
        {
          excludeExtraneousValues: true,
        },
      );
      coursePlaceDto.sort = index + 1;
      placeSorting.push(coursePlaceDto);
    }

    const courseRecommendResDto = new CourseRecommendResDto({
      uuid: generateUUID(),
      subway: dto.subway,
      theme_cafe: dto.theme_cafe,
      theme_restaurant: dto.theme_restaurant, // 오타 수정: restuarant -> restaurant
      count: dto.customs?.length ?? 0, // 옵셔널 체이닝과 널 병합 연산자 사용
      place: placeSorting,
    });

    // 나중에 가중치 삭감 반영
    // 트랜잭션

    return DetailResponseDto.from(courseRecommendResDto);
  }
}
