import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/commons/constants/error';
import { CursorPaginatedResponseDto } from 'src/commons/dtos/cursor-paginated-response.dto';
import { ListResponseDto } from 'src/commons/dtos/list-response.dto';
import { isEmpty } from 'src/commons/util/is/is-empty';
import { PlaceEntity } from 'src/entities/place.entity';
import { ApiPlaceGetCultureDetailResponseDto } from 'src/place/dto/api-place-get-culture-detail-response.dto';
import { ApiPlaceGetCultureRequestQueryDto } from 'src/place/dto/api-place-get-culture-request-query.dto';
import { ApiPlaceGetCultureResponseDto } from 'src/place/dto/api-place-get-culture-response.dto';
import { ApiPlaceGetDetailResponseDto } from 'src/place/dto/api-place-get-detail-response.dto';
import { ApiPlaceGetExhibitionRequestQueryDto } from 'src/place/dto/api-place-get-exhibition-request-query.dto';
import { ApiPlaceGetExhibitionResponseDto } from 'src/place/dto/api-place-get-exhibition-response.dto';
import { ApiPlaceGetPopupRequestQueryDto } from 'src/place/dto/api-place-get-popup-request-query.dto';
import { ApiPlaceGetPopupResponseDto } from 'src/place/dto/api-place-get-popup-response.dto';
import { PlaceQueryRepository } from 'src/place/place.query.repository';

@Injectable()
export class PlaceService {
  constructor(private readonly placeQueryRepository: PlaceQueryRepository) {}

  async findCultureList(
    dto: ApiPlaceGetCultureRequestQueryDto,
  ): Promise<ListResponseDto<ApiPlaceGetCultureResponseDto>> {
    const cultureList: PlaceEntity[] = await this.placeQueryRepository.findList(dto);
    if (!cultureList || cultureList.length === 0) {
      return { items: [] };
    }

    return {
      items: plainToInstance(ApiPlaceGetCultureResponseDto, cultureList, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async findCultureDetail(uuid: string): Promise<ApiPlaceGetCultureDetailResponseDto> {
    const culture: PlaceEntity = await this.placeQueryRepository.findOne(uuid);
    if (isEmpty(culture)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    return plainToInstance(ApiPlaceGetCultureDetailResponseDto, culture, {
      excludeExtraneousValues: true,
    });
  }

  async findExhibitionList(
    dto: ApiPlaceGetExhibitionRequestQueryDto,
  ): Promise<CursorPaginatedResponseDto<ApiPlaceGetExhibitionResponseDto>> {
    const totalCount: number = await this.placeQueryRepository.countExhibition();
    if (totalCount === 0) {
      return { items: [], total_count: 0, next_page: null };
    }

    const { items, nextCursor } = await this.placeQueryRepository.findExhibitionList(dto);

    return {
      items: plainToInstance(ApiPlaceGetExhibitionResponseDto, items, {
        excludeExtraneousValues: true,
      }),
      total_count: totalCount,
      next_page: nextCursor,
    };
  }

  async findPopupList(
    dto: ApiPlaceGetPopupRequestQueryDto,
  ): Promise<CursorPaginatedResponseDto<ApiPlaceGetPopupResponseDto>> {
    const totalCount: number = await this.placeQueryRepository.countPopup();
    if (totalCount === 0) {
      return { items: [], total_count: 0, next_page: null };
    }

    const { items, nextCursor } = await this.placeQueryRepository.findPopupList(dto);

    return {
      items: plainToInstance(ApiPlaceGetPopupResponseDto, items, {
        excludeExtraneousValues: true,
      }),
      total_count: totalCount,
      next_page: nextCursor,
    };
  }

  async findPlaceDetail(uuid: string): Promise<ApiPlaceGetDetailResponseDto> {
    const placeDetail: PlaceEntity = await this.placeQueryRepository.findOne(uuid);
    if (isEmpty(placeDetail)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    return plainToInstance(ApiPlaceGetDetailResponseDto, placeDetail, {
      excludeExtraneousValues: true,
    });
  }
}
