import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceEntity } from 'src/entities/place.entity';
import { SearchLogEntity } from 'src/entities/search_log.entity';
import { PlaceModule } from 'src/place/place.module';
import { SearchController } from './search.controller';
import { SearchQueryLogRepository } from './search.log.query.repository';
import { SearchQueryRepository } from './search.query.repository';
import { SearchService } from './search.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlaceEntity, SearchLogEntity]), PlaceModule],
  controllers: [SearchController],
  providers: [SearchService, SearchQueryRepository, SearchQueryLogRepository],
})
export class SearchModule {}
