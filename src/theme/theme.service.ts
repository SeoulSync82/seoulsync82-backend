import { Injectable } from '@nestjs/common';
import { plainToClass, plainToInstance } from 'class-transformer';
import { ResponseDataDto, ResponseDto } from 'src/commons/dto/response.dto';
import { ThemeEntity } from 'src/entities/theme.entity';
import { ThemeListDto } from './dto/theme.dto';
import { ThemeQueryRepository } from './theme.query.repository';

@Injectable()
export class ThemeService {
  constructor(private readonly themeQueryRepository: ThemeQueryRepository) {}

  async themeList() {
    const themeList: ThemeEntity[] = await this.themeQueryRepository.findList();

    const themeListDto = plainToInstance(ThemeListDto, themeList, {
      excludeExtraneousValues: true,
    });

    return { items: themeListDto };
  }
}
