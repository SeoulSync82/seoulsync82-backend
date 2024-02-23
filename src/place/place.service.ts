import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/auth/constants/error';
import { isEmpty } from 'src/commons/util/is/is-empty';
import { PlaceEntity } from 'src/entities/place.entity';
import { ApiPlaceGetCultureDetailResponseDto } from './dto/api-place-get-culture-detail-response.dto';
import { ApiPlaceGetCultureRequestQueryDto } from './dto/api-place-get-culture-request-query.dto';
import { ApiPlaceGetCultureResponseDto } from './dto/api-place-get-culture-response.dto';
import { ApiPlaceGetDetailResponseDto } from './dto/api-place-get-detail-response.dto';
import { ApiPlaceGetExhibitionRequestQueryDto } from './dto/api-place-get-exhibition-request-query.dto';
import { ApiPlaceGetExhibitionResponseDto } from './dto/api-place-get-exhibition-response.dto';
import { ApiPlaceGetPopupRequestQueryDto } from './dto/api-place-get-popup-request-query.dto';
import { ApiPlaceGetPopupResponseDto } from './dto/api-place-get-popup-response.dto';
import { PlaceQueryRepository } from './place.query.repository';

@Injectable()
export class PlaceService {
  constructor(private readonly placeQueryRepository: PlaceQueryRepository) {}

  async findCultureList(dto: ApiPlaceGetCultureRequestQueryDto) {
    const cultureList: PlaceEntity[] = await this.placeQueryRepository.findList(dto);
    if (!cultureList || cultureList.length === 0) {
      return { items: [] };
    }

    const apiPlaceCultureGetResponseDto: ApiPlaceGetCultureResponseDto[] = plainToInstance(
      ApiPlaceGetCultureResponseDto,
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

    const apiPlaceCultureDetailGetResponseDto: ApiPlaceGetCultureDetailResponseDto =
      plainToInstance(ApiPlaceGetCultureDetailResponseDto, culture, {
        excludeExtraneousValues: true,
      });

    return apiPlaceCultureDetailGetResponseDto;
  }

  async findExhibitionList(dto: ApiPlaceGetExhibitionRequestQueryDto) {
    const exhibitionList: PlaceEntity[] = await this.placeQueryRepository.findExhibitionList(dto);
    if (!exhibitionList || exhibitionList.length === 0) {
      return { items: [] };
    }

    const apiPlaceExhibitionGetResponseDto: ApiPlaceGetExhibitionResponseDto[] = plainToInstance(
      ApiPlaceGetExhibitionResponseDto,
      exhibitionList,
      {
        excludeExtraneousValues: true,
      },
    );

    const last_item_id =
      exhibitionList.length === dto.size ? exhibitionList[exhibitionList.length - 1].id : 0;

    return { items: apiPlaceExhibitionGetResponseDto, last_item_id };
  }

  async findPopupList(dto: ApiPlaceGetPopupRequestQueryDto) {
    const popupList: PlaceEntity[] = await this.placeQueryRepository.findPopupList(dto);
    if (!popupList || popupList.length === 0) {
      return { items: [] };
    }

    const apiPlacePopupGetResponseDto: ApiPlaceGetPopupResponseDto[] = plainToInstance(
      ApiPlaceGetPopupResponseDto,
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

    const apiPlaceDetailGetResponseDto: ApiPlaceGetDetailResponseDto = plainToInstance(
      ApiPlaceGetDetailResponseDto,
      placeDetail,
      {
        excludeExtraneousValues: true,
      },
    );

    return apiPlaceDetailGetResponseDto;
  }
}
