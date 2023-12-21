import { Injectable, NotFoundException } from '@nestjs/common';
import { DetailResponseDto, ResponseDataDto } from 'src/commons/dto/response.dto';
import { PlaceEntity } from 'src/entities/place.entity';
import { CultureDto, CultureListDto, ExhibitionDto, PlaceReadDto, PopupDto } from './dto/place.dto';
import { PlaceQueryRepository } from './place.query.repository';
import { plainToInstance } from 'class-transformer';
import { ERROR } from 'src/auth/constants/error';

@Injectable()
export class PlaceService {
  constructor(private readonly placeQueryRepository: PlaceQueryRepository) {}

  async findCultureList(dto: PlaceReadDto) {
    const cultureList: PlaceEntity[] = await this.placeQueryRepository.findList(dto);
    if (!cultureList || cultureList.length === 0) {
      return ResponseDataDto.from([], null, 0);
    }

    const cultureListDto: CultureListDto[] = plainToInstance(CultureListDto, cultureList, {
      excludeExtraneousValues: true,
    });

    const last_item_id =
      cultureList.length === dto.size ? cultureList[cultureList.length - 1].id : 0;

    return { items: cultureListDto, last_item_id };
  }

  async findCultureOne(uuid) {
    const culture: PlaceEntity = await this.placeQueryRepository.findOne(uuid);
    if (!culture) {
      throw new NotFoundException(ERROR.NOT_EXIST_DATA);
    }

    const cultureDto: CultureDto = plainToInstance(CultureDto, culture, {
      excludeExtraneousValues: true,
    });

    return cultureDto;
  }

  async findExhibitionList(dto: PlaceReadDto) {
    const exhibitionList: PlaceEntity[] = await this.placeQueryRepository.findExhibitionList(dto);
    if (!exhibitionList || exhibitionList.length === 0) {
      return ResponseDataDto.from([], null, 0);
    }

    const exhibitionDto: ExhibitionDto[] = plainToInstance(ExhibitionDto, exhibitionList, {
      excludeExtraneousValues: true,
    });

    const last_item_id =
      exhibitionList.length === dto.size ? exhibitionList[exhibitionList.length - 1].id : 0;

    return { items: exhibitionDto, last_item_id };
  }

  async findPopupList(dto: PlaceReadDto) {
    const popupList: PlaceEntity[] = await this.placeQueryRepository.findPopupList(dto);
    if (!popupList || popupList.length === 0) {
      return ResponseDataDto.from([], null, 0);
    }

    const popupDto: PopupDto[] = plainToInstance(PopupDto, popupList, {
      excludeExtraneousValues: true,
    });

    const last_item_id = popupList.length === dto.size ? popupList[popupList.length - 1].id : 0;

    return { items: popupDto, last_item_id };
  }
}
