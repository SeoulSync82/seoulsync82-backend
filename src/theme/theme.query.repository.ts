import { InjectRepository } from '@nestjs/typeorm';
import { ThemeEntity } from 'src/entities/theme.entity';
import { Repository } from 'typeorm';

export class ThemeQueryRepository {
  constructor(
    @InjectRepository(ThemeEntity)
    private repository: Repository<ThemeEntity>,
  ) {}

  async findList(): Promise<ThemeEntity[]> {
    return await this.repository.find();
  }

  async findThemeUuid(theme_uuid: string): Promise<ThemeEntity> {
    return await this.repository.findOne({
      where: { uuid: theme_uuid },
    });
  }
}
