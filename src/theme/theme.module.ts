import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThemeEntity } from 'src/entities/theme.entity';
import { ThemeController } from 'src/theme/theme.controller';
import { ThemeQueryRepository } from 'src/theme/theme.query.repository';
import { ThemeService } from 'src/theme/theme.service';

@Module({
  imports: [TypeOrmModule.forFeature([ThemeEntity])],
  controllers: [ThemeController],
  providers: [ThemeService, ThemeQueryRepository],
  exports: [ThemeQueryRepository],
})
export class ThemeModule {}
