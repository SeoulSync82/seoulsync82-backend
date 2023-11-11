import { Injectable } from '@nestjs/common';
import { ResponseDataDto, ResponseDto } from 'src/commons/dto/response.dto';
import { ThemeEntity } from 'src/entities/theme.entity';
import { ThemeQueryRepository } from './theme.query.repository';

@Injectable()
export class ThemeService {
  constructor(private readonly themeQueryRepository: ThemeQueryRepository) {}

  async themeList() {
    const themeList: ThemeEntity[] = await this.themeQueryRepository.findList();

    return ResponseDataDto.from(themeList, null, 0);
  }
}
