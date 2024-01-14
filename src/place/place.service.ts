import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/auth/constants/error';
import { isEmpty } from 'src/commons/util/is/is-empty';
import { PlaceEntity } from 'src/entities/place.entity';
import { ApiPlaceCultureDetailGetResponseDto } from './dto/api-place-culture-detail-get-response.dto';
import { ApiPlaceCultureGetRequestQueryDto } from './dto/api-place-culture-get-request-query.dto';
import { ApiPlaceCultureGetResponseDto } from './dto/api-place-culture-get-response.dto';
import { ApiPlaceDetailGetResponseDto } from './dto/api-place-detail-get-response.dto';
import { ApiPlaceExhibitionGetRequestQueryDto } from './dto/api-place-exhibition-get-request-query.dto';
import { ApiPlaceExhibitionGetResponseDto } from './dto/api-place-exhibition-get-response.dto';
import { ApiPlacePopupGetRequestQueryDto } from './dto/api-place-popup-get-request-query.dto';
import { ApiPlacePopupGetResponseDto } from './dto/api-place-popup-get-response.dto';
import { PlaceQueryRepository } from './place.query.repository';

@Injectable()
export class PlaceService {
  constructor(private readonly placeQueryRepository: PlaceQueryRepository) {}

  async findCultureList(dto: ApiPlaceCultureGetRequestQueryDto) {
    const cultureList: PlaceEntity[] = await this.placeQueryRepository.findList(dto);
    if (!cultureList || cultureList.length === 0) {
      return { items: [] };
    }

    const apiPlaceCultureGetResponseDto: ApiPlaceCultureGetResponseDto[] = plainToInstance(
      ApiPlaceCultureGetResponseDto,
      cultureList,
      {
        excludeExtraneousValues: true,
      },
    );

    const last_item_id =
      cultureList.length === dto.size ? cultureList[cultureList.length - 1].id : 0;

    return { items: apiPlaceCultureGetResponseDto, last_item_id };
  }

  async findCultureDetail(uuid) {
    const culture: PlaceEntity = await this.placeQueryRepository.findOne(uuid);
    if (isEmpty(culture)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const apiPlaceCultureDetailGetResponseDto: ApiPlaceCultureDetailGetResponseDto =
      plainToInstance(ApiPlaceCultureDetailGetResponseDto, culture, {
        excludeExtraneousValues: true,
      });

    return apiPlaceCultureDetailGetResponseDto;
  }

  async findExhibitionList(dto: ApiPlaceExhibitionGetRequestQueryDto) {
    const exhibitionList: PlaceEntity[] = await this.placeQueryRepository.findExhibitionList(dto);
    if (!exhibitionList || exhibitionList.length === 0) {
      return { items: [] };
    }

    const apiPlaceExhibitionGetResponseDto: ApiPlaceExhibitionGetResponseDto[] = plainToInstance(
      ApiPlaceExhibitionGetResponseDto,
      exhibitionList,
      {
        excludeExtraneousValues: true,
      },
    );

    const last_item_id =
      exhibitionList.length === dto.size ? exhibitionList[exhibitionList.length - 1].id : 0;

    return { items: apiPlaceExhibitionGetResponseDto, last_item_id };
  }

  async findPopupList(dto: ApiPlacePopupGetRequestQueryDto) {
    const popupList: PlaceEntity[] = await this.placeQueryRepository.findPopupList(dto);
    if (!popupList || popupList.length === 0) {
      return { items: [] };
    }

    const apiPlacePopupGetResponseDto: ApiPlacePopupGetResponseDto[] = plainToInstance(
      ApiPlacePopupGetResponseDto,
      popupList,
      {
        excludeExtraneousValues: true,
      },
    );

    const last_item_id = popupList.length === dto.size ? popupList[popupList.length - 1].id : 0;

    return { items: apiPlacePopupGetResponseDto, last_item_id };
  }

  async findPlaceDetail(uuid) {
    const placeDetail: PlaceEntity = await this.placeQueryRepository.findOne(uuid);
    if (isEmpty(placeDetail)) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const apiPlaceDetailGetResponseDto: ApiPlaceDetailGetResponseDto = plainToInstance(
      ApiPlaceDetailGetResponseDto,
      placeDetail,
      {
        excludeExtraneousValues: true,
      },
    );

    return apiPlaceDetailGetResponseDto;
  }
}
