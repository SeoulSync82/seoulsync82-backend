import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceEntity } from 'src/entities/place.entity';
import { SearchLogEntity } from 'src/entities/search_log.entity';
import { PlaceModule } from 'src/place/place.module';
import { SearchController } from 'src/search/search.controller';
import { SearchQueryRepository } from 'src/search/search.query.repository';
import { SearchService } from 'src/search/search.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlaceEntity, SearchLogEntity]), PlaceModule],
  controllers: [SearchController],
  providers: [SearchService, SearchQueryRepository],
})
export class SearchModule {}
