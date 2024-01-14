import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ThemeEntity } from 'src/entities/theme.entity';
import { ApiThemeListGetResponseDto } from './dto/api-theme-list-get-response.dto';
import { ThemeQueryRepository } from './theme.query.repository';

@Injectable()
export class ThemeService {
  constructor(private readonly themeQueryRepository: ThemeQueryRepository) {}

  async themeList() {
    const themeList: ThemeEntity[] = await this.themeQueryRepository.findList();

    const apiThemeListGetResponseDto = plainToInstance(ApiThemeListGetResponseDto, themeList, {
      excludeExtraneousValues: true,
    });

    return { items: apiThemeListGetResponseDto };
  }
}
