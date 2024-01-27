import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/auth/constants/error';
import { isEmpty } from 'src/commons/util/is/is-empty';
import { CustomListDto } from 'src/place/dto/subway.dto';
import { ApiCourseSubwayCheckGetRequestQueryDto } from './dto/api-course-subway-check-get-request-query.dto';
import { ApiCourseSubwayCheckGetResponseDto } from './dto/api-course-subway-check-get-response.dto';
import { ApiCourseSubwayListGetRequestQueryDto } from './dto/api-course-subway-list-get-request-query.dto';
import { ApiCourseSubwayListGetResponseDto } from './dto/api-course-subway-list-get-response.dto';
import { SubwayQueryRepository } from './subway.query.repository';

@Injectable()
export class SubwayService {
  constructor(private readonly subwayQueryRepository: SubwayQueryRepository) {}

  async subwayCustomsCheck(dto: ApiCourseSubwayCheckGetRequestQueryDto) {
    const subwayCustoms = await this.subwayQueryRepository.groupByCustoms(dto);

    function findCountByType(type, results) {
      const item = results.find((item) => item.type === type);
      return item ? parseInt(item.count, 10) : 0;
    }

    const customsCheck = new CustomListDto({
      음식점: findCountByType('음식점', subwayCustoms),
      카페: findCountByType('카페', subwayCustoms),
      술집: findCountByType('술집', subwayCustoms),
      쇼핑: findCountByType('쇼핑', subwayCustoms),
      문화: findCountByType('전시', subwayCustoms) + findCountByType('팝업', subwayCustoms),
      놀거리: findCountByType('놀거리', subwayCustoms),
    });

    return new ApiCourseSubwayCheckGetResponseDto({ customs: [customsCheck] });
  }

  async subwayStationList(dto: ApiCourseSubwayListGetRequestQueryDto) {
    const subwayStationList = await this.subwayQueryRepository.subwayStationList(dto);
    if (isEmpty(subwayStationList)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const apiCourseSubwayListGetResponseDto = plainToInstance(
      ApiCourseSubwayListGetResponseDto,
      subwayStationList.map((item) => item.name),
      { excludeExtraneousValues: true },
    );

    return { name: apiCourseSubwayListGetResponseDto };
  }
}
