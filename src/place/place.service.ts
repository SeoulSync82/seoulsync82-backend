import { Injectable } from '@nestjs/common';
import { ResponseDataDto } from 'src/commons/dto/response.dto';
import { PlaceEntity } from 'src/entities/place.entity';
import { PlaceReadDto } from './dto/place.dto';
import { PlaceQueryRepository } from './place.query.repository';

@Injectable()
export class PlaceService {
  constructor(private readonly placeQueryRepository: PlaceQueryRepository) {}

  async findExhibition(dto: PlaceReadDto) {
    const exhibition: PlaceEntity[] = await this.placeQueryRepository.findList(dto);
    if (!exhibition || exhibition.length === 0) {
      return ResponseDataDto.from([], null, 0);
    }

    const last_item_id = exhibition.length > 0 ? exhibition[exhibition.length - 1].id : 0;
    return ResponseDataDto.from(exhibition, null, last_item_id);
  }
}
