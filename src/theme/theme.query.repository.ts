import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThemeEntity } from 'src/entities/theme.entity';

export class ThemeQueryRepository {
  constructor(
    @InjectRepository(ThemeEntity)
    private repository: Repository<ThemeEntity>,
  ) {}

  async findList(): Promise<ThemeEntity[]> {
    return this.repository.find();
  }

  async findThemeUuid(themeUuid: string): Promise<ThemeEntity> {
    return this.repository.findOne({
      where: { uuid: themeUuid },
    });
  }

  async findThemeName(themeName: string): Promise<ThemeEntity> {
    return this.repository.findOne({
      where: { theme_name: themeName },
    });
  }
}
