import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ThemeEntity } from 'src/entities/theme.entity';
import { ApiThemeGetListResponseDto } from 'src/theme/dto/api-theme-get-list-response.dto';
import { ThemeQueryRepository } from 'src/theme/theme.query.repository';

@Injectable()
export class ThemeService {
  constructor(private readonly themeQueryRepository: ThemeQueryRepository) {}

  async themeList(): Promise<{ items: ApiThemeGetListResponseDto[] }> {
    const themeList: ThemeEntity[] = await this.themeQueryRepository.findList();

    const apiThemeListGetResponseDto = plainToInstance(ApiThemeGetListResponseDto, themeList, {
      excludeExtraneousValues: true,
    });

    return { items: apiThemeListGetResponseDto };
  }
}
